import { EmailVerification } from "../emails/EmailVerification";
import { ForgotPassword } from "../emails/ForgotPassword";
import { MagicLink } from "../emails/MagicLink";
import { NewUser } from "../emails/NewUser";
import { NewsletterSignup } from "../emails/NewsletterSignup";
import { OrganizationInvitation } from "../emails/OrganizationInvitation";
import { VerificationApproved } from "../emails/VerificationApproved";
import { VerificationRejected } from "../emails/VerificationRejected";

export const mailTemplates = {
	magicLink: MagicLink,
	forgotPassword: ForgotPassword,
	newUser: NewUser,
	newsletterSignup: NewsletterSignup,
	organizationInvitation: OrganizationInvitation,
	emailVerification: EmailVerification,
	verificationApproved: VerificationApproved,
	verificationRejected: VerificationRejected,
} as const;
