import { authService } from '../services/auth.service.js';
import { setupAuthPage, bindAuthForm, showNotice, authParams } from '../components/auth-form.js';
import { $ } from '../utils/dom.js';

if (setupAuthPage()) {
  if (authParams.has('keluar')) showNotice('Anda sudah keluar. Sampai jumpa lagi!');
  else if (authParams.has('next')) showNotice('Silakan masuk terlebih dahulu untuk membuka halaman itu.');

  bindAuthForm($('[data-auth-form]'), ({ email, password }) => authService.login(email, password));
}
