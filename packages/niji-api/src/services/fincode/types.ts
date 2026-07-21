/**
 * fincode byGMO API request / response 型定義 (Phase 2 backend 統合、 Issue #3115)
 *
 * fincode 公式仕様 (JSON) の shape を TypeScript 型として集約する。
 * client.ts はここで定義した型を build / parse する責務のみを持つ。
 *
 * 決済 flow (card token 経路) —
 * (1) webapp が fincode.js iframe で card tokenize、 card_id を受領 (Phase 1c 完了)
 * (2) webapp が backend POST /api/v1/fiat-bid/authorize-fincode に card_id + amount + orderId 送信
 * (3) backend が fincode POST /v1/payments で payment 登録 (job_code=AUTH、 status=CHECKED)
 * (4) backend が fincode PUT /v1/payments/{id} で payment 実行 (method=1、 token=card_id、 status=AUTHORIZED)
 * (5) backend が webapp に authId + status 応答 (3DS 必要時は acs_url 併記)
 *
 * SSOT — https://docs.fincode.jp/api (公式 API リファレンス)、
 *        packages/niji-api/src/services/gmo/types.ts (GMO 世代の対比 pattern)
 */

/** POST /v1/payments (payment 登録) request body */
export type FincodePaymentRegisterRequest = {
  /** 決済手段 (Card / Konbini / Paypay / 等)、 Phase 2 は Card 固定 */
  pay_type: 'Card';
  /** 決済処理区分 (AUTH = 与信のみ / CAPTURE = 与信 + 売上確定 / CHECK) */
  job_code: 'AUTH' | 'CAPTURE' | 'CHECK';
  /** 決済額 (円単位、 fincode は文字列で送受信) */
  amount: string;
  /** 加盟店側 order ID (fiat_bid.authId PK に一致させて後段 lookup 可能に) */
  id: string;
  /** 通貨 (default JPY、 fincode 現状 JPY のみ) */
  client_field_1?: string;
};

/** POST /v1/payments 成功応答 */
export type FincodePaymentRegisterSuccess = {
  /** 加盟店側 order ID (request の id と同値) */
  id: string;
  /** 決済 access ID (fincode 側の一意識別子、 PUT /payments/{id} で使用) */
  access_id: string;
  /** 決済 status (登録直後は CHECKED) */
  status: 'CHECKED';
  /** 決済処理区分 */
  job_code: string;
  /** 決済額 */
  amount: string;
};

/** PUT /v1/payments/{id} (payment 実行) request body */
export type FincodePaymentExecuteRequest = {
  pay_type: 'Card';
  /** POST /payments で発行された access_id */
  access_id: string;
  /** 実行方法 (1 = 一回払い、 2 = 分割払い、 3 = リボ払い)、 Phase 2 は 1 固定 */
  method: '1';
  /** fincode card token (webapp iframe tokenize 経由取得) */
  token: string;
  /** 3DS 2.0 認証後の webapp 側 return URL (Phase 3 で使用) */
  tds2_ret_url?: string;
  /** 3DS 認証タイプ (2 = 3DS 2.0)、 Phase 3 で使用 */
  tds2_type?: '2';
};

/** PUT /v1/payments/{id} 成功応答 */
export type FincodePaymentExecuteSuccess = {
  id: string;
  access_id: string;
  /** 決済 status (AUTHORIZED = 与信成功 / CAPTURED = 売上確定成功 / AUTHENTICATED = 3DS 認証必要) */
  status: 'AUTHORIZED' | 'CAPTURED' | 'AUTHENTICATED';
  job_code: string;
  amount: string;
  /** 3DS 認証 redirect URL (status = AUTHENTICATED 時のみ返却) */
  acs_url?: string;
  /** fincode 側 transaction ID (経緯 audit 用) */
  transaction_id?: string;
  /** authorization 承認番号 (伝票印字用) */
  approve?: string;
};

/** PUT /v1/payments/{id}/capture (与信 → 売上確定) request body。
 * fincode 公式 sdk-node の CapturingPaymentRequest 仕様準拠、 job_code は含まず method 指定のみ。
 * SSOT — https://github.com/fincode-byGMO/fincode-sdk-node src/types/payment.ts § CapturingPaymentRequest */
export type FincodePaymentCaptureRequest = {
  pay_type: 'Card';
  /** POST /payments で発行された access_id */
  access_id: string;
  /** 課金方法 (1 = 一括、 2 = 分割)、 job_type が AUTH or CAPTURE 時に必須 */
  method: '1';
};

/** PUT /v1/payments/{id}/capture 成功応答 (execute と同 shape、 status = CAPTURED) */
export type FincodePaymentCaptureSuccess = FincodePaymentExecuteSuccess;

/** fincode error 応答 shape (HTTP 4xx / 5xx 時に返却) */
export type FincodeErrorResponse = {
  errors: Array<{
    error_code: string;
    error_message: string;
  }>;
};

/**
 * 3DS 2.0 認証結果コード。
 *
 * - `Y` = 認証成功
 * - `A` = 認証試行済 (成功扱いで決済に進める)
 * - `C` = チャレンジ認証が必要 (challenge_url へ遷移させる)
 * - `N` = 認証失敗 or 決済拒否
 * - `U` = 認証不能
 * - `R` = 認証拒否
 *
 * SSOT — fincode 公式 sdk-node `src/types/payment.ts` の ThreeDSecureAuthResult。
 */
export type FincodeThreeDSecureAuthResult = 'Y' | 'A' | 'C' | 'N' | 'U' | 'R';

/**
 * PUT /v1/secure2/{access_id} (3DS 2.0 認証実行) request body。
 * tds2_ret_url に redirect されてきた直後に呼ぶ。
 */
export type FincodeExecute3DSecureAuthRequest = {
  pay_type: 'Card';
  access_id: string;
};

/** PUT /v1/secure2/{access_id} 応答 */
export type FincodeExecute3DSecureAuthSuccess = {
  tds2_trans_result?: FincodeThreeDSecureAuthResult | null;
  tds2_trans_result_reason?: string | null;
  /** tds2_trans_result = 'C' のときのみ返る、 チャレンジ認証画面の URL */
  challenge_url?: string | null;
};

/** GET /v1/secure2/{access_id} (認証結果取得) 応答。 challenge 完了後の再確認に使う */
export type FincodeRetrieve3DSecureAuthSuccess = {
  tds2_trans_result?: FincodeThreeDSecureAuthResult | null;
  tds2_trans_result_reason?: string | null;
};

/**
 * PUT /v1/payments/{id}/secure (認証後決済実行) request body。
 * 3DS 認証が Y / A で通った後にこれを呼んで初めて与信が確定する。
 */
export type FincodeExecuteAfter3DSecureRequest = {
  pay_type: 'Card';
  access_id: string;
};

/** 3DS 認証を経た決済の統合結果 (handler が webapp に返す判定材料) */
export type FincodeThreeDSecureResult = {
  /** 認証結果コード (fincode 応答そのまま、 未返却時は undefined) */
  transResult: FincodeThreeDSecureAuthResult | undefined;
  /** 認証結果の理由 (fincode 応答そのまま) */
  reason: string | undefined;
  /** transResult = 'C' のときのチャレンジ URL */
  challengeUrl: string | undefined;
  /** 認証後決済実行まで完了して与信が確定したか */
  authorized: boolean;
  /** 与信確定時の決済 status */
  status: FincodePaymentExecuteSuccess['status'] | undefined;
};

/** authorize 統合結果 (register + execute 順次呼出後の返却型、 handler が使う) */
export type FincodeAuthorizationResult = {
  /** fincode auth ID (fiat_bid.authId PK に一致、 access_id を採用) */
  authId: string;
  /** fincode access_id (subsequent PUT /payments/{id} で使用) */
  accessId: string;
  /** 3DS 認証 redirect URL (3DS 不要時は undefined) */
  tds2Url: string | undefined;
  /** 加盟店側 order ID */
  orderId: string;
  /** 決済 status (AUTHORIZED / CAPTURED / AUTHENTICATED) */
  status: FincodePaymentExecuteSuccess['status'];
  /** authorization 承認番号 */
  approve: string | undefined;
  /** fincode transaction ID */
  transactionId: string | undefined;
};
