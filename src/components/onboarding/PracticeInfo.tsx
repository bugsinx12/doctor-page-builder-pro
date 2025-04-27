
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Practice name must be at least 2 characters"),
  specialty: z.string().min(2, "Specialty must be at least 2 characters"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email address").optional(),
});

type PracticeInfoFormValues = z.infer<typeof formSchema>;

interface PracticeInfoProps {
  practiceInfo: {
    name: string;
    specialty: string;
    address: string;
    phone: string;
    email: string;
  };
  onChange: (info: PracticeInfoFormValues) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PracticeInfo = ({ 
  practiceInfo, 
  onChange, 
  onNext, 
  onPrevious 
}: PracticeInfoProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PracticeInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: practiceInfo.name || '',
      specialty: practiceInfo.specialty || '',
      address: practiceInfo.address || '',
      phone: practiceInfo.phone || '',
      email: practiceInfo.email || '',
    },
  });

  // Update form when practiceInfo changes
  React.useEffect(() => {
    if (practiceInfo) {
      form.reset({
        name: practiceInfo.name || '',
        specialty: practiceInfo.specialty || '',
        address: practiceInfo.address || '',
        phone: practiceInfo.phone || '',
        email: practiceInfo.email || '',
      });
    }
  }, [form, practiceInfo]);

  async function onSubmit(values: PracticeInfoFormValues) {
    setIsSubmitting(true);
    
    try {
      onChange(values);
      await onNext();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Practice Information</h2>
      <p className="text-gray-600 mb-6">
        Tell us about your medical practice. This information will be used to customize your website.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Practice Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Wellness Medical Center" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Specialty *</FormLabel>
                  <FormControl>
                    <Input placeholder="Family Medicine, Cardiology, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="123 Medical Plaza, Suite 100, City, State, ZIP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@yourpractice.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrevious}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PracticeInfo;
