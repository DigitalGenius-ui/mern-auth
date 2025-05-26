import resend from "../config/resend";
import { EMAIL_SENDER, FRONTEND_URL, NODE_ENV } from "../constants/env";
import { UserModel } from "../Model/AuthModels";
import { getVerifyEmailTemplate } from "./emailTemplate";
type Params = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const getFromEmail = () =>
  NODE_ENV === "development" ? "onboarding@resend.dev" : EMAIL_SENDER;

const getToEmail = (to: string) =>
  NODE_ENV === "development" ? "delivered@resend.dev" : to;

export const sendEmail = async ({ to, subject, text, html }: Params) => {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "delivered@resend.dev",
    subject,
    html,
    text,
  });
};

type User = {
  dataValues: typeof UserModel.prototype.dataValues;
};
