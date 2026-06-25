import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID || "6a3af7eb2448b8000d3c4aa5",
      "PLAID-SECRET": process.env.PLAID_SECRET || "7e10f0e57964e0aec36a9f196e40eb",
    },
  },
});

export const plaidClient = new PlaidApi(configuration);
