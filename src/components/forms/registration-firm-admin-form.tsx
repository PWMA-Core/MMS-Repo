import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  registerFirmAdminSchema,
  type RegisterFirmAdminInput,
} from '@/lib/validators/registration'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function RegistrationFirmAdminForm() {
  const navigate = useNavigate()

  const form = useForm<RegisterFirmAdminInput>({
    resolver: zodResolver(registerFirmAdminSchema),
    defaultValues: {
      firm_name: '',
      business_registration_number: '',
      firm_contact_email: '',
      firm_contact_phone: '',
      firm_address: '',
      hkid: '',
      legal_name: '',
      date_of_birth: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (input: RegisterFirmAdminInput) => {
      // 1. Create auth user
      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError

      // 2. Create member_firm row
      const { data: firm, error: firmError } = await supabase
        .from('member_firms')
        .insert({
          name: input.firm_name,
          business_registration_number: input.business_registration_number,
          contact_email: input.firm_contact_email,
          contact_phone: input.firm_contact_phone,
          address: input.firm_address || null,
          tier: 'pending',
          status: 'pending',
        })
        .select('id')
        .single()
      if (firmError || !firm) throw firmError ?? new Error('Firm creation failed')

      // 3. Create admin profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          auth_user_id: auth.user?.id ?? null,
          hkid: input.hkid,
          email: input.email,
          legal_name: input.legal_name,
          date_of_birth: input.date_of_birth,
          phone: input.phone,
          role: 'member_firm_admin',
          account_status: 'pending_email_verify',
        })
        .select('id')
        .single()
      if (profileError || !profile) {
        throw profileError ?? new Error('Profile creation failed')
      }

      // 4. Create firm_membership row (admin)
      const { error: membershipError } = await supabase
        .from('firm_memberships')
        .insert({
          profile_id: profile.id,
          firm_id: firm.id,
          role_in_firm: 'admin',
        })
      if (membershipError) throw membershipError

      return { auth, firm, profile }
    },
    onSuccess: () => {
      toast.success('Firm registered. Check your email to verify.')
      navigate('/verify')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Firm registration failed')
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        <Tabs defaultValue="firm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="firm">1. Firm details</TabsTrigger>
            <TabsTrigger value="admin">2. Your profile</TabsTrigger>
          </TabsList>
          <TabsContent value="firm" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="firm_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firm name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="business_registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business registration number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firm_contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firm contact email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firm_contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firm contact phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firm_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firm address (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="admin" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="hkid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your HKID</FormLabel>
                  <FormControl>
                    <Input placeholder="A123456(3)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Protected field. Cannot be changed without PWMA approval.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (login)</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Registering firm...' : 'Register firm'}
        </Button>
      </form>
    </Form>
  )
}
