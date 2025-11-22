declare module "connect-history-api-fallback" {
  import { RequestHandler } from "express";

  interface Options {
    verbose?: boolean;
    index?: string;
    htmlAcceptHeaders?: string[];
    rewrites?: Array<{
      from: RegExp;
      to: string | ((context: any) => string);
    }>;
    disableDotRule?: boolean;
  }

  function historyApiFallback(options?: Options): RequestHandler;

  export default historyApiFallback;
}
