import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const CreateTestUsers = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const createUser = async () => {
    if (!email || !password) {
      toast({
        title: "خطا",
        description: "لطفا ایمیل و پسورد را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/functions/v1/create-admin-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "موفقیت",
          description: `کاربر ${role === 'admin' ? 'مدیر' : 'عادی'} با موفقیت ایجاد شد`,
        });
        setEmail('');
        setPassword('');
      } else {
        toast({
          title: "خطا",
          description: result.error || "خطا در ایجاد کاربر",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPredefinedUsers = async () => {
    const users = [
      { email: 'admin@test.com', password: '123456', role: 'admin' },
      { email: 'user@test.com', password: '123456', role: 'user' }
    ];

    setLoading(true);

    for (const user of users) {
      try {
        const response = await fetch('/functions/v1/create-admin-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user)
        });

        if (!response.ok) {
          const result = await response.json();
          console.error(`Failed to create ${user.role}:`, result.error);
        }
      } catch (error) {
        console.error(`Error creating ${user.role}:`, error);
      }
    }

    setLoading(false);
    
    toast({
      title: "کاربران تست ایجاد شدند",
      description: "admin@test.com (مدیر) و user@test.com (کاربر) با پسورد 123456",
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>ایجاد کاربران تست</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">ایمیل</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@test.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">پسورد</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">نقش</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="انتخاب نقش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">کاربر عادی</SelectItem>
              <SelectItem value="admin">مدیر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={createUser} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          ایجاد کاربر
        </Button>

        <div className="border-t pt-4">
          <Button 
            onClick={createPredefinedUsers} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ایجاد کاربران تست پیش‌فرض
          </Button>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            admin@test.com (مدیر) و user@test.com (کاربر) با پسورد 123456
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateTestUsers;