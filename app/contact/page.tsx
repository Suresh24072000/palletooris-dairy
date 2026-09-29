"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Delivery Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        name: "",
        phone: "",
        email: "",
        subject: "Delivery Inquiry",
        message: "",
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-bold uppercase tracking-[3px] text-[#b77932]">
            Get In Touch
          </p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-black text-[#173b27]">
            We&apos;d Love to Hear From You
          </h1>
          <p className="mt-3 text-base text-[#52665d]">
            Have a question about our morning delivery areas, milk subscriptions, bulk orders, or farm tours? Reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* CONTACT INFO CARDS */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8efd9] text-[#126044]">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#173b27]">Farm Location</h3>
                <p className="mt-1 text-sm text-[#52665d]">
                  Palletoori&apos;s Dairy Farm, Survey No. 84, Shamshabad Rural, Hyderabad, Telangana 501218
                </p>
                <p className="mt-1 text-xs text-gray-400">Visitors welcome on weekends with prior appointment.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8efd9] text-[#126044]">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#173b27]">Phone &amp; WhatsApp</h3>
                <p className="mt-1 text-sm text-[#52665d]">
                  Dispatch Desk: <a href="tel:+919876543210" className="font-bold text-[#173b27] hover:underline">+91 98765 43210</a>
                </p>
                <div className="mt-3">
                  <a
                    href="https://wa.me/919876543210?text=Hello%20Palletoori's%20Dairy%20Farm,%20I%20have%20an%20inquiry."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#126044] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#0e5039]"
                  >
                    💬 Direct WhatsApp Support
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8efd9] text-[#126044]">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#173b27]">Operating Timings</h3>
                <p className="mt-1 text-sm text-[#52665d]">
                  Morning Milking &amp; Dispatch: <strong>5:00 AM – 9:00 AM</strong>
                </p>
                <p className="text-sm text-[#52665d]">
                  Evening Dispatch: <strong>5:00 PM – 8:00 PM</strong>
                </p>
                <p className="text-xs text-gray-400 mt-1">Customer support active 7 days a week.</p>
              </div>
            </div>
          </div>

          {/* INQUIRY FORM */}
          <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-black text-[#173b27] mb-2">
              Send Us a Message
            </h3>
            <p className="text-xs text-[#52665d] mb-6">
              Fill out this form and our customer relations manager will reply within 2 hours.
            </p>

            {submitted ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-200">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
                <h4 className="text-base font-bold text-emerald-800">
                  Message Sent Successfully!
                </h4>
                <p className="text-xs text-emerald-600 mt-1">
                  Thank you for reaching out. We will get in touch with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Suresh Reddy"
                      className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-xs outline-none focus:border-[#126044]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-xs outline-none focus:border-[#126044]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="suresh@example.com"
                      className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-xs outline-none focus:border-[#126044]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Subject
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-xs outline-none"
                    >
                      <option value="Delivery Inquiry">Delivery Area Inquiry</option>
                      <option value="Milk Subscription">Daily Milk Subscription</option>
                      <option value="Bulk Order">Bulk Order (Functions / Events)</option>
                      <option value="Farm Visit">Schedule a Farm Visit</option>
                      <option value="Feedback">Feedback / Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your requirement or location..."
                    className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-xs outline-none focus:border-[#126044]"
                  />
                </div>

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#126044] text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#0e5039]"
                >
                  <Send size={14} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
