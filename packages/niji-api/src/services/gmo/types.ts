/**
 * GMO PGマルチペイメント API request/response 型定義 (Issue #3006 Phase A)
 *
 * GMO 公式仕様 (form-encoded KEY=VALUE&KEY=VALUE) の shape を TypeScript 型として集約する。
 * client.ts はここで定義した型を parse / build する責務のみを持つ。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P2, P6、
 *        Phase1-02-issue-breakdown.md § Issue 3、
 *        packages/niji-api/src/mocks/gmo-server.ts (mock 側 response shape との整合)
 */

/** entryTran (取引登録) request param */
export type EntryTranRequest = {
  /** 加盟店 ID */
  shopId: string;
  /** 加盟店 password */
  shopPass: string;
  /** 加盟店側 order ID (auth ID PK に一致させて後段 handler で lookup 可能に) */
  orderId: string;
  /** JobCd = AUTH (与信枠取得のみ、 Phase 1 は SALES 即時決済を使わない) */
  jobCd: 'AUTH' | 'SALES';
  /** 与信枠額 (円単位、 GMO 仕様) */
  amount: number;
};

/** entryTran 成功応答 (form-encoded parse 済) */
export type EntryTranSuccess = {
  accessId: string;
  accessPass: string;
};

/** entryTran / execTran / alterTran 共通の error 応答 shape */
export type GmoErrorResponse = {
  errCode: string;
  errInfo: string;
};

/** execTran (決済実行 + 3DS URL 発行) request param */
export type ExecTranRequest = {
  accessId: string;
  accessPass: string;
  orderId: string;
  /** GMO PG Token 方式で受渡す card token (webapp が GMO に直接 POST して受領) */
  cardToken: string;
  /** 3DS 2.0 認証後の webapp 側 return URL (mock は default で使わない) */
  tds2RetUrl?: string;
};

/** execTran 成功応答 */
export type ExecTranSuccess = {
  /** ACS = '1' の場合 3DS 認証必要 */
  acs: string;
  /** 3DS 認証 redirect URL (mock は dummy URL) */
  acsUrl: string;
  orderId: string;
  accessId: string;
  approve: string;
  tranId: string;
  tranDate: string;
};

/** entryTran + execTran を順次呼出した後の返却型 (authorize handler が使う) */
export type AuthorizationResult = {
  /** GMO auth ID (実装上 accessId を採用、 fiat_bid.authId PK に一致) */
  authId: string;
  accessPass: string;
  /** 3DS 認証 redirect URL */
  tds2Url: string;
  orderId: string;
  approve: string;
  tranId: string;
};

/**
 * secureTran2 (3DS 2.0 認証結果 verify) request param (Issue #3007)
 * GMO は 3DS 認証完了後の callback で /secureTran2 endpoint で認証状態を verify する
 */
export type SecureTran2Request = {
  accessId: string;
  accessPass: string;
  /** GMO 側 transactionId (3DS 認証 flow の一意識別子) */
  transactionId: string;
};

/**
 * secureTran2 成功応答 (3DS 認証成功 = TranResult=0 が返る)
 * mock / 実 GMO 共通で ACS 認証状態 + tranResult を返す
 */
export type SecureTran2Success = {
  orderId: string;
  accessId: string;
  /** 3DS 認証結果 (成功なら "0"、 fail なら error) */
  tranResult: string;
};

/**
 * alterTran (決済取消 / cancel / refund) request param (Issue #3007 の cancel 用途 + Issue #3010 の capture 用途で共用)
 * JobCd = VOID (取消) / SALES (売上確定 / capture) / RETURN (返金)
 * Phase 1 で 3ds fail の cancel 用途は JobCd=VOID 経路のみ使う
 */
export type AlterTranRequest = {
  shopId: string;
  shopPass: string;
  accessId: string;
  accessPass: string;
  jobCd: 'VOID' | 'SALES' | 'RETURN';
  /** VOID / SALES 時に必須、 amount 単位 = 円 */
  amount?: number;
};

/** alterTran 成功応答 (form-encoded parse 済) */
export type AlterTranSuccess = {
  accessId: string;
  accessPass: string;
  /** 取引後 status (SALES / VOID / AUTH / RETURN) */
  status: string;
};
