import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import AuthPage from '@/components/AuthPage';
import StaffAuthPage from '@/components/StaffAuthPage';
import Dashboard from '@/components/Dashboard';
import UserSettings from '@/components/UserSettings';

interface StaffLoginData {
  staff_id: string;
  pharmacy_id: string;
  staff_name: string;
  username: string;
  role: string;
  pharmacy_name: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staffData, setStaffData] = useState<StaffLoginData | null>(null);
  const [loginMode, setLoginMode] = useState<'manager' | 'staff'>('manager');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Index component mounted, setting up auth');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, 'Session:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }} dir="rtl">
      {user ? (
        <Dashboard user={user} onAuthChange={setUser} />
      ) : (
        <AuthPage user={user} onAuthChange={setUser} />
      )}
    </div>
  );
};

export default Index;