import React, { useState, useRef, useEffect } from 'react';
import { Phone, Lock, Check } from 'lucide-react';

interface CustomerLoginProps {
  onLoginSuccess: (data: any) => void;
  isLoading?: boolean;
}

type Step = 'register' | 'verify-otp' | 'set-pin' | 'login';

/**
 * CustomerLogin - Portal customer login/register
 * Flow: Register (phone) -> Verify OTP -> Set PIN -> Login (phone + PIN)
 */
const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLoginSuccess, isLoading = false }) => {
  const [step, setStep] = useState<Step>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!phoneNumber || !name || !unitNumber) {
      setError('Semua field harus diisi');
      return;
    }

    try {
      const response = await fetch('/api/auth/customer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          name,
          unitNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrasi gagal');
        return;
      }

      setCustomerId(data.customerId);
      setMessage(`✓ OTP berhasil dikirim ke WhatsApp ${phoneNumber}`);
      setTimeout(() => setStep('verify-otp'), 1500);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 6) {
      setError('OTP harus 6 digit');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verifikasi OTP gagal');
        return;
      }

      setMessage('✓ OTP terverifikasi. Buat PIN untuk keamanan akun Anda');
      setTimeout(() => setStep('set-pin'), 1500);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin || pin.length < 4 || pin.length > 6) {
      setError('PIN harus 4-6 digit');
      return;
    }

    if (pin !== confirmPin) {
      setError('PIN tidak cocok');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError('PIN hanya boleh angka');
      return;
    }

    try {
      // Get access token dari verify-otp terlebih dahulu
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          otpCode,
        }),
      });

      const verifyData = await verifyResponse.json();

      // Set PIN dengan access token
      const setPinResponse = await fetch('/api/auth/set-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${verifyData.accessToken}`,
        },
        body: JSON.stringify({ pin }),
      });

      if (!setPinResponse.ok) {
        setError('Gagal menyimpan PIN');
        return;
      }

      setMessage('✓ PIN berhasil dibuat. Silakan login dengan nomor HP dan PIN');
      setTimeout(() => setStep('login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || !pin) {
      setError('Nomor HP dan PIN harus diisi');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN tidak valid');
      return;
    }

    try {
      const response = await fetch('/api/auth/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login gagal');
        return;
      }

      localStorage.setItem('pp_customer_token', data.accessToken);
      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">PickPoint Portal</h1>
          <p className="text-slate-500">Lacak paket Anda dengan mudah</p>
        </div>

        {/* Forms */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Error/Success Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              {message}
            </div>
          )}

          {/* Register Step */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nomor HP (WA)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="085212345678"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nomor Unit
                </label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="A-101"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Daftar & Terima OTP'}
              </button>

              <p className="text-center text-sm text-slate-600">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Login
                </button>
              </p>
            </form>
          )}

          {/* Verify OTP Step */}
          {step === 'verify-otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-sm text-slate-600">
                Masukkan kode OTP yang dikirim ke {phoneNumber} melalui WhatsApp
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kode OTP (6 digit)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('register')}
                className="w-full text-blue-600 hover:underline font-semibold"
              >
                Kembali
              </button>
            </form>
          )}

          {/* Set PIN Step */}
          {step === 'set-pin' && (
            <form onSubmit={handleSetPin} className="space-y-4">
              <p className="text-sm text-slate-600">
                Buat PIN untuk keamanan akun Anda (4-6 digit)
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Konfirmasi PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan PIN & Lanjut'}
              </button>
            </form>
          )}

          {/* Login Step */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="085212345678"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {isLoading ? 'Memproses...' : 'Login'}
              </button>

              <p className="text-center text-sm text-slate-600">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Daftar
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          PickPoint © 2025 - Sistem Manajemen Paket
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
