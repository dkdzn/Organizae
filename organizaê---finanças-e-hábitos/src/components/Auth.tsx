import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from './ui/Common';
import { motion } from 'motion/react';

interface AuthProps {
  onSuccess: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Gerar um email sintético para o Firebase Auth baseado no nome de usuário
    const safeUsername = username.toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '');

    if (!safeUsername || safeUsername.length < 3) {
      setError('O nome de usuário deve ter pelo menos 3 letras ou números.');
      setLoading(false);
      return;
    }

    const syntheticEmail = `${safeUsername}@organiza.app`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, syntheticEmail, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, syntheticEmail, password);
        
        try {
          await updateProfile(userCredential.user, { displayName: username.trim() });
          
          const userPath = `users/${userCredential.user.uid}`;
          await setDoc(doc(db, userPath), {
            username: safeUsername,
            email: syntheticEmail,
            displayName: username.trim(),
            initialBalance: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (firestoreErr) {
          console.error("Erro ao criar perfil no Firestore:", firestoreErr);
          const userPath = `users/${userCredential.user.uid}`;
          handleFirestoreError(firestoreErr, OperationType.CREATE, userPath);
        }
      }
      onSuccess();
    } catch (err: any) {
      console.error("Erro de Autenticação Completo:", err);
      let message = 'Ocorreu um erro ao processar sua solicitação.';
      
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) {
          message = `Erro: ${parsed.error}`;
        }
      } catch {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-email') {
          message = 'Usuário ou senha incorretos.';
        } else if (err.code === 'auth/email-already-in-use') {
          message = 'Este nome de usuário já está sendo utilizado.';
        } else if (err.code === 'auth/weak-password') {
          message = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (err.code === 'auth/operation-not-allowed') {
          message = 'O provedor de E-mail/Senha não está ativado no Firebase Console.';
        } else if (err.code === 'permission-denied') {
          message = 'Permissão negada ao salvar seus dados.';
        }
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 lg:p-12"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="font-display text-3xl font-black text-slate-900 mb-2">Organizaê</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            {isLogin ? 'Faça seu login' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Seu Nome ou Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium placeholder:text-slate-300"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="password"
              placeholder="Sua Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium placeholder:text-slate-300"
            />
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Entrar no App' : 'Confirmar Cadastro'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-slate-50">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-indigo-600 transition-colors"
          >
            {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já sou cadastrado? Fazer Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
