import { authService } from '../services/auth.service.js';
import { setupAuthPage, bindAuthForm } from '../components/auth-form.js';
import { $ } from '../utils/dom.js';

if (setupAuthPage()) {
  bindAuthForm($('[data-auth-form]'), async ({ password2, ...data }) => {
    if (data.password !== password2) {
      $('#reg-password2').setAttribute('aria-invalid', 'true');
      throw new Error('Konfirmasi password tidak sama.');
    }
    await authService.register(data);
  });
}
