import { Link, Text } from "@react-email/components";
import React from "react";
import { createTranslator } from "use-intl/core";
import PrimaryButton from "../src/components/PrimaryButton";
import Wrapper from "../src/components/Wrapper";
import { defaultTranslations } from "../src/util/translations";
import { defaultLocale } from "../src/util/translations";
import type { BaseMailProps } from "../types";

export function VerificationApproved({
  name,
  loginUrl,
  locale,
  translations,
}: {
  name: string;
  loginUrl: string;
} & BaseMailProps) {
  const t = createTranslator({
    locale,
    messages: translations,
  });

  return (
    <Wrapper>
      <Text className="text-2xl font-bold text-green-600 mb-4">
        🎉 Verification Approved!
      </Text>

      <Text>Hi {name},</Text>

      <Text>
        Great news! Your account verification has been <strong>approved</strong>.
        You now have full access to all platform features.
      </Text>

      <Text>
        You can now:
        <ul>
          <li>• Browse and book services from providers</li>
          <li>• Access all premium features</li>
          <li>• Join the UNIBEN community marketplace</li>
        </ul>
      </Text>

      <PrimaryButton href={loginUrl}>
        Access Your Account &rarr;
      </PrimaryButton>

      <Text className="text-muted-foreground text-sm mt-6">
        Welcome to the platform! If you have any questions, don't hesitate to contact our support team.
      </Text>

      <Text className="text-muted-foreground text-sm">
        If you can't click the button above, copy and paste this link into your browser:
        <br />
        <Link href={loginUrl}>{loginUrl}</Link>
      </Text>
    </Wrapper>
  );
}

VerificationApproved.PreviewProps = {
  locale: defaultLocale,
  translations: defaultTranslations,
  name: "John Doe",
  loginUrl: "https://example.com/app",
};

export default VerificationApproved;
