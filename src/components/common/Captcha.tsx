import HCaptcha from '@hcaptcha/react-hcaptcha';
import { PUBLIC_HCAPTCHA_SITE_KEY } from 'astro:env/client';

interface Props {
  onToken: (token: string | null) => void;
}

/** Renders nothing when no site key is configured, so forms work in dev without hCaptcha. */
export default function Captcha({ onToken }: Props) {
  if (!PUBLIC_HCAPTCHA_SITE_KEY) return null;
  return <HCaptcha sitekey={PUBLIC_HCAPTCHA_SITE_KEY} onVerify={onToken} onExpire={() => onToken(null)} />;
}
