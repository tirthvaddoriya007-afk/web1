declare module "paytmchecksum" {
  const PaytmChecksum: {
    generateSignature(
      payload: string | Record<string, string>,
      merchantKey: string
    ): Promise<string>;
    verifySignature(
      payload: string | Record<string, string>,
      merchantKey: string,
      signature: string
    ): boolean | Promise<boolean>;
  };

  export = PaytmChecksum;
}
