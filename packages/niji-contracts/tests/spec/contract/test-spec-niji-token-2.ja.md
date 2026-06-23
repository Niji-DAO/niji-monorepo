# test-spec — NijiToken Phase 1 完全版 (Foundry contract test)

> Phase 1 kiwa chain (Issue #295) で生成、 既存 test-spec-niji-token.ja.md (8 観点 11 TC) を 11 観点全 cover + 全 ABI 経路 cover に拡張した版。
> Layer 2 (`/kiwa-forge`) で `test/foundry/Phase1/NijiToken.t.sol` に変換される。

## 対象機能

NijiToken の全 ABI 経路 (mint / burn / mintBatch / reveal / placeholder / baseURI / pause / withdraw / lock 系 / view / governance signature adapter) を 11 観点で網羅。
ERC721 / ERC721Enumerable / ERC721Votes / Ownable2Step / Pausable / ReentrancyGuard の継承層も含めて回帰検証する。

## 仕様の要約

| 領域 | 主要関数 / event | 仕様 |
|---|---|---|
| mint 系 | `mint(to)` / `mint()` / `mintBatch(to, quantity)` / `_mintTo(to)` | onlyMinter + nonReentrant + isMintingActive + maxSupply 検査 + placeholder URI 必須 (pre-reveal) + seeds[tokenId] 永続化 + NijiMinted event |
| burn 系 | `burn(tokenId)` | onlyMinter + nonReentrant + unbid auction settle 用、 seeds は残置 (mapping 仕様) |
| reveal 系 | `setPlaceholderURI(uri)` / `reveal()` / `placeholderURI()` / `isRevealed` | pre-reveal で URI 設定必須、 reveal 後は placeholder 上書き不可、 BatchMetadataUpdate event |
| baseURI 系 | `setBaseURI(uri)` / `lockBaseURI()` / `baseURI()` / `isBaseURILocked` | post-reveal で baseURI fallback、 lock 後は変更不可、 BatchMetadataUpdate event |
| pause 系 | `pause()` / `unpause()` / inherited `paused()` | onlyOwner、 mint / transfer / burn を停止 (Pausable._update) |
| withdraw 系 | `withdraw()` / `withdrawAmount(amount)` / `receive()` | onlyOwner + nonReentrant、 balance == 0 で revert、 transfer 失敗 revert data 保持 |
| 管理 系 | `setDescriptor` / `setSeeder` / `lockContracts` / `setMinter` / `toggleMinting` / `setMintingActive` / `setContractURIHash` / `setProvenanceHash` / `lockProvenanceHash` | onlyOwner、 各 event emit、 lock 後は 2 回目で revert |
| view 系 | `tokenURI(tokenId)` / `getSeed` / `getTraitIndices` / `currentTokenId` / `exists` / `remainingSupply` / `contractURI` | 存在しない tokenId は revert (`TokenDoesNotExist`)、 unrevealed = placeholder / revealed+baseURI = `{base}{id}.json` / revealed = descriptor |
| 制約 系 | `renounceOwnership()` | 常に revert (RenounceOwnershipDisabled) |
| ERC165 | `supportsInterface(interfaceId)` | IVotes / IERC4906 / ERC721 / ERC721Enumerable を advertise |
| governance adapter | `getPriorVotes(account, blockNumber)` / `getCurrentVotes(account)` | uint96 cast、 overflow で require revert |

## 主な品質リスク

| 基準 | スコア | 根拠 1 文 |
|---|---|---|
| 売上影響 | 高 | mint 関数の権限 bypass / placeholder 未設定 mint で free mint または marketplace 表示不全のリスク |
| セキュリティ影響 | 高 | onlyMinter / onlyOwner / nonReentrant / Pausable / lockContracts の組合せ崩れで永続的 contract 制御喪失 |
| データ破壊リスク | 中 | seeds mapping は burn でクリアされない (Nouns 互換仕様、 意図的)、 reveal は一方通行 (誤発火で post-reveal 状態が不可逆) |
| 利用頻度 | 高 | 全 auction で mint 1 回 + tokenURI 表示 / vote / transfer で日次多発 |
| 過去障害履歴 | 中 | PlaceholderURI 未設定で setUp fail (PR #294 で fix 済)、 該当領域は回帰必須 |

→ **総合リスク = 高**

## 推奨テスト構成

Foundry forge test (`test/foundry/Phase1/NijiToken.t.sol`)、 11 観点 35 TC。
fuzz / invariant は境界値 / 並行処理観点で使用 (forge-std/Test cheatcode 経由)。

## テスト観点一覧

11 観点全選択。

1 正常系 (常に) / 2 異常系 (外部依存あり) / 3 境界値 (maxSupply / mintBatch quantity / withdrawAmount) / 4 状態遷移 (mintingActive / reveal / isContractsLocked / isBaseURILocked / paused) / 5 権限 (onlyMinter / onlyOwner / non-owner reject) / 6 入力バリデーション (address(0) / empty string) / 7 冪等性 (lock 系の 2 回目 revert / reveal 2 回目 revert) / 8 並行処理 (nonReentrant 経由 reentrancy 攻撃) / 9 性能 (mintBatch 50 件 gas) / 10 セキュリティ (renounceOwnership disabled / Pausable / placeholder enforcement / lockContracts 後の admin) / 11 回帰 (PR #294 PlaceholderURI fix + 既存 8 観点 11 TC)

## テストケース一覧

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-001 | 単体 | 正常系 | minter setup 済 + placeholder URI 設定済 + mintingActive=true | `to=alice` | `vm.prank(minter); token.mint(alice)` | tokenId=0 が返り、 alice owner、 NijiMinted event emit、 _currentTokenId=1 | 高 | 必須 |
| TC-002 | 単体 | 正常系 | 同上 | (引数なし) | `vm.prank(minter); token.mint()` | tokenId=0 が返り、 minter owner (AuctionHouse 互換) | 高 | 必須 |
| TC-003 | 単体 | 正常系 | 同上 | `to=alice, quantity=5` | `vm.prank(minter); token.mintBatch(alice, 5)` | tokenIds = [0..4]、 全 alice owner、 5 件の NijiMinted event | 高 | 必須 |
| TC-004 | 単体 | 正常系 | token mint 済 (tokenId=0) + minter setup | `tokenId=0` | `vm.prank(minter); token.burn(0)` | _ownerOf(0) == address(0)、 totalSupply -1 | 高 | 必須 |
| TC-005 | 単体 | 正常系 | placeholder 未設定 | `'ipfs://placeholder.json'` | `token.setPlaceholderURI('ipfs://placeholder.json')` | placeholderURI() = 'ipfs://placeholder.json'、 PlaceholderURIUpdated + BatchMetadataUpdate event | 高 | 必須 |
| TC-006 | 単体 | 正常系 | placeholder 設定済 + token mint 済 + pre-reveal | `tokenId=0` | `token.reveal()` | isRevealed=true、 Revealed + BatchMetadataUpdate event | 高 | 必須 |
| TC-007 | 単体 | 異常系 | mintingActive=false | `to=alice` | `vm.prank(minter); token.mint(alice)` | `MintingNotActive()` revert | 高 | 必須 |
| TC-008 | 単体 | 異常系 | maxSupply=10 + _currentTokenId=10 | `to=alice` | `vm.prank(minter); token.mint(alice)` | `MaxSupplyReached()` revert | 高 | 必須 |
| TC-009 | 単体 | 異常系 | placeholder 未設定 + mintingActive=true | `to=alice` | `vm.prank(minter); token.mint(alice)` | `PlaceholderURINotSet()` revert (PR #294 fix の回帰防御) | 高 | 必須 |
| TC-010 | 単体 | 異常系 | mintingActive=true | `to=alice, quantity=51` | `vm.prank(minter); token.mintBatch(alice, 51)` | `MintBatchQuantityExceedsLimit(51, 50)` revert | 高 | 必須 |
| TC-011 | 単体 | 異常系 | reveal 済 | `'ipfs://retry.json'` | `token.setPlaceholderURI('ipfs://retry.json')` | `RevealAlreadyDone()` revert | 中 | 必須 |
| TC-012 | 単体 | 異常系 | reveal 済 | (引数なし) | `token.reveal()` | `RevealAlreadyDone()` revert | 中 | 必須 |
| TC-013 | 単体 | 異常系 | 存在しない tokenId | `tokenId=999` | `token.tokenURI(999)` | `TokenDoesNotExist()` revert | 高 | 必須 |
| TC-014 | 単体 | 異常系 | contract balance = 0 | (引数なし) | `vm.prank(owner); token.withdraw()` | `WithdrawAmountExceedsBalance()` revert | 高 | 必須 |
| TC-015 | 単体 | 異常系 | contract balance = 1 ether + amount=2 ether | `amount=2 ether` | `vm.prank(owner); token.withdrawAmount(2 ether)` | `WithdrawAmountExceedsBalance()` revert | 高 | 必須 |
| TC-016 | 単体 | 境界値 | mintingActive=true | `to=alice, quantity=50` | `vm.prank(minter); token.mintBatch(alice, 50)` | tokenIds = [0..49]、 全成功 (MAX_MINT_BATCH_SIZE ちょうど) | 高 | 必須 |
| TC-017 | 単体 | 境界値 | maxSupply=10 + _currentTokenId=9 | `to=alice, quantity=2` | `vm.prank(minter); token.mintBatch(alice, 2)` | `MaxSupplyReached()` revert (9+2 > 10) | 中 | 必須 |
| TC-018 | 単体 | 境界値 | contract balance = 1 ether | `amount=0` | `vm.prank(owner); token.withdrawAmount(0)` | `WithdrawAmountExceedsBalance()` revert (amount==0 check) | 中 | 必須 |
| TC-019 | 単体 | 状態遷移 | mintingActive=false | (引数なし) | `vm.prank(owner); token.toggleMinting()` (×2) | active → inactive → active、 各 MintingToggled event | 中 | 必須 |
| TC-020 | 単体 | 状態遷移 | descriptor / seeder 設定済 | (引数なし) | `vm.prank(owner); token.lockContracts()` | isContractsLocked=true、 ContractsLocked event | 中 | 必須 |
| TC-021 | 単体 | 状態遷移 | baseURI 設定済 | (引数なし) | `vm.prank(owner); token.lockBaseURI()` | isBaseURILocked=true、 BaseURILocked event | 中 | 必須 |
| TC-022 | 単体 | 状態遷移 | mint 済 + unpaused | (引数なし) | `vm.prank(owner); token.pause()` → `token.mint(alice)` → `token.unpause()` → `token.mint(alice)` | pause 中 mint は Pausable revert、 unpause 後は成功 | 高 | 必須 |
| TC-023 | 単体 | 権限 | minter != caller | `to=bob` | `vm.prank(bob); token.mint(bob)` | `OnlyMinter()` revert | 高 | 必須 |
| TC-024 | 単体 | 権限 | owner != caller | `to=bob` | `vm.prank(bob); token.setMinter(bob)` | `OwnableUnauthorizedAccount(bob)` revert | 高 | 必須 |
| TC-025 | 単体 | 権限 | owner != caller | `'newhash'` | `vm.prank(bob); token.setProvenanceHash('newhash')` | `OwnableUnauthorizedAccount(bob)` revert | 中 | 必須 |
| TC-026 | 単体 | 入力バリデーション | (deploy) | `_name=''` | `new NijiToken('', 'NIJI', descriptor, seeder, 0)` | `EmptyAddress()` revert | 中 | 必須 |
| TC-027 | 単体 | 入力バリデーション | (deploy) | `_descriptor=address(0)` | `new NijiToken('Niji', 'NIJI', address(0), seeder, 0)` | `DescriptorNotSet()` revert | 中 | 必須 |
| TC-028 | 単体 | 入力バリデーション | (deploy) | `_seeder=address(0)` | `new NijiToken('Niji', 'NIJI', descriptor, address(0), 0)` | `SeederNotSet()` revert | 中 | 必須 |
| TC-029 | 単体 | 入力バリデーション | placeholder 設定 | `''` | `vm.prank(owner); token.setPlaceholderURI('')` | `EmptyPlaceholderURI()` revert | 中 | 必須 |
| TC-030 | 単体 | 冪等性 | lockContracts 済 | (引数なし) | `vm.prank(owner); token.lockContracts()` (2 回目) | `ContractsAreLocked()` revert | 中 | 必須 |
| TC-031 | 単体 | 冪等性 | lockProvenanceHash 済 | `'updated'` | `vm.prank(owner); token.setProvenanceHash('updated')` | `ProvenanceHashLocked()` revert | 中 | 必須 |
| TC-032 | 単体 | 並行処理 | reentrancy attacker contract setup | mint 時 fallback で再 mint | attacker → token.mint → attacker.onERC721Received → token.mint (re-entry) | nonReentrant で 2 回目 mint が ReentrancyGuard revert | 高 | 必須 |
| TC-033 | 単体 | 性能 | mintingActive=true | `to=alice, quantity=50` | `vm.prank(minter); uint256 gas = gasleft(); token.mintBatch(alice, 50); gas -= gasleft()` | gas < 50 * 200_000 (1 件あたり 200k gas 上限) | 中 | 推奨 |
| TC-034 | 単体 | セキュリティ | (owner caller) | (引数なし) | `vm.prank(owner); token.renounceOwnership()` | `RenounceOwnershipDisabled()` revert | 高 | 必須 |
| TC-035 | 単体 | 回帰 | reveal 前 + placeholder 設定済 + token mint 済 | `tokenId=0` | `token.tokenURI(0)` | placeholderURI() を返す (descriptor/baseURI 呼ばない) | 高 | 必須 |

## 自動化すべきテスト

全 35 件 自動化推奨 (forge test)。 優先度高 (TC-001 〜 015 / 022 / 023 / 024 / 032 / 034 / 035) 25 件は CI gate、 中 (TC-011 / 017 〜 021 / 025 〜 031 / 033) 10 件は coverage 上昇に貢献。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- `getPriorVotes` / `getCurrentVotes` の uint96 overflow テストは Phase 2 (governance 領域) で扱う (現状 ERC721Votes の票数は 2^96 以下で実用上 overflow 不能、 防御 only check)
- `supportsInterface(IVotes / IERC4906 / ERC721Enumerable)` の advertisement は Phase 2 で別 spec 化
- ERC4906 BatchMetadataUpdate event の indexed topic 検証は forge expectEmit で確認可、 spec table の TC-005 / TC-006 / TC-021 で部分 cover
- multi-tab / multi-user race condition は wallet UX 領域、 e2e spec (kiwa-play) で扱う

## Layer 2 連携

- `/kiwa-forge --module niji-token --layer contract` で本 spec を `test/foundry/Phase1/NijiToken.t.sol` に変換、 forge fuzz は TC-016 / TC-017 / TC-018 / TC-033 で利用 (`testFuzz_*` 命名)
- 推奨観点 → ランナー mapping ... 境界値 = `forge fuzz` / 状態遷移 = `forge invariant` (lockContracts / lockBaseURI / reveal の 1 way 遷移) / 並行処理 = `vm.expectRevert(ReentrancyGuardReentrantCall.selector)`
