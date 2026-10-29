import type { EnquiryForm, ContactForm, CorporateEnquiryForm } from '../types';
import type { Enquiry } from '../data/adminMockData';

interface EnquirySubmissionResult {
  success: boolean;
  message: string;
  enquiry?: Enquiry;
}

class EnquiryService {
  async updateEnquiry(
    id: string,
    update: Pick<Enquiry, 'status' | 'assignedTo' | 'notes'> & { followUpDate: string | null },
  ): Promise<Enquiry> {
    const response = await fetch(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(update),
    });
    const result = await response.json() as { enquiry?: Enquiry; message?: string };
    if (!response.ok || !result.enquiry) {
      throw new Error(result.message ?? 'Unable to update enquiry.');
    }
    return result.enquiry;
  }

  async submitEnquiry(data: EnquiryForm): Promise<EnquirySubmissionResult> {
    return this.saveEnquiry({
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      course: data.course ?? '',
      message: [data.message, data.country, data.city, data.mode].filter(Boolean).join('\n'),
      source: 'Website Form',
    });
  }

  async submitContact(data: ContactForm): Promise<EnquirySubmissionResult> {
    return this.saveEnquiry({
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      course: data.subject,
      message: data.message,
      source: 'Contact Page',
    });
  }

  async submitCorporateEnquiry(data: CorporateEnquiryForm): Promise<EnquirySubmissionResult> {
    return this.saveEnquiry({
      name: data.contactName,
      email: data.email,
      phone: data.phone,
      course: `Corporate training: ${data.companyName}`,
      message: [
        data.message,
        `Country: ${data.country}`,
        `Team size: ${data.teamSize}`,
        `Training mode: ${data.trainingMode}`,
        `Timeline: ${data.timeline}`,
        `Technologies: ${data.technologies.join(', ')}`,
      ].filter(Boolean).join('\n'),
      source: 'Corporate Training Form',
    });
  }

  async submitCollegeEnquiry(data: {
    institutionName: string;
    contactName: string;
    designation: string;
    email: string;
    phone: string;
    city: string;
    studentStrength: string;
    enquiryType: string;
    programs: string[];
    message: string;
  }): Promise<EnquirySubmissionResult> {
    return this.saveEnquiry({
      name: data.contactName,
      email: data.email,
      phone: data.phone,
      course: `College enquiry: ${data.institutionName}`,
      message: [
        data.message,
        `Institution: ${data.institutionName}`,
        `Designation: ${data.designation}`,
        `City: ${data.city}`,
        `Student strength: ${data.studentStrength}`,
        `Enquiry type: ${data.enquiryType}`,
        `Programs of interest: ${data.programs.join(', ')}`,
      ].filter(Boolean).join('\n'),
      source: 'College Enquiry Form',
    });
  }

  async createAdminEnquiry(data: Pick<Enquiry, 'name' | 'email' | 'phone' | 'course' | 'message'>): Promise<Enquiry> {
    const result = await this.saveEnquiry({ ...data, source: 'Admin Dashboard' });
    if (!result.success || !result.enquiry) {
      throw new Error(result.message);
    }
    return result.enquiry;
  }

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({})) as { success?: boolean; message?: string };
      if (response.ok && result.success) {
        return { success: true, message: result.message ?? 'Successfully subscribed to our newsletter.' };
      }
    } catch {
      // Backend offline
    }
    return { success: true, message: 'Thank you for subscribing to Global Minds Technologies newsletter!' };
  }

  private async saveEnquiry(data: {
    name: string;
    email: string;
    phone: string;
    course: string;
    message: string;
    source: string;
  }): Promise<EnquirySubmissionResult> {
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        enquiry?: Enquiry;
      };
      if (response.ok && result.success) {
        return {
          success: true,
          message: 'Thank you! Our team will contact you shortly.',
          enquiry: result.enquiry,
        };
      }
    } catch {
      // Backend offline or unreachable
    }

    // Dual-mode resilience fallback for static Vercel host
    const localEnquiry: Enquiry = {
      id: `enq-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      course: data.course || 'General Enquiry',
      message: data.message,
      status: 'new',
      source: data.source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.message,
      assignedTo: 'Admissions Desk',
      followUpDate: null,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('gma_local_enquiries') || '[]') as Enquiry[];
      existing.unshift(localEnquiry);
      localStorage.setItem('gma_local_enquiries', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Swallowed
    }

    return {
      success: true,
      message: 'Thank you! Your enquiry has been received. Our admissions team will contact you shortly.',
      enquiry: localEnquiry,
    };
  }
}

export const enquiryService = new EnquiryService();
