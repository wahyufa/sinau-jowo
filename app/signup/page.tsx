import AuthForm from "@/components/AuthForm";
import { signup } from "@/lib/actions";

export default function SignupPage() {
  return (
    <main className="auth-page">
      <AuthForm
        action={signup}
        variant="signup"
        subtitle="Buat akun gratis, progres belajarmu tersimpan otomatis"
        submitLabel="Daftar"
        footerText="Sudah punya akun?"
        footerLinkText="Masuk"
        footerLinkHref="/login"
      />
    </main>
  );
}
