import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/actions";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <AuthForm
        action={login}
        variant="login"
        subtitle="Masuk untuk lanjut belajar basa Jawa alus"
        submitLabel="Masuk"
        footerText="Belum punya akun?"
        footerLinkText="Daftar"
        footerLinkHref="/signup"
      />
    </main>
  );
}
