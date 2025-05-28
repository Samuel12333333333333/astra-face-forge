
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = [
    {
      question: "How does AI headshot generation work?",
      answer: "Our AI technology analyzes your uploaded photos to learn your unique facial features and characteristics. It then generates professional headshots in various styles while maintaining your likeness and ensuring high quality results."
    },
    {
      question: "How many photos do I need to upload?",
      answer: "We recommend uploading 5-20 high-quality photos of yourself from different angles and with varied expressions. More photos generally lead to better results as the AI has more data to learn from."
    },
    {
      question: "How long does the AI training take?",
      answer: "The AI training process typically takes 20-30 minutes. You'll receive an email notification when your model is ready, so you can safely leave the page during training."
    },
    {
      question: "What photo quality should I upload?",
      answer: "Upload clear, well-lit photos where your face is clearly visible. Avoid blurry, heavily filtered, or low-resolution images. The better your input photos, the better your AI headshots will be."
    },
    {
      question: "Can I generate unlimited headshots?",
      answer: "The number of headshots you can generate depends on your chosen plan. Our plans range from 50 to 500 generations, with the Business plan offering unlimited generations."
    },
    {
      question: "What styles are available?",
      answer: "We offer various professional styles including Corporate, Business Casual, Creative, and Formal. Each style is optimized for different use cases like LinkedIn profiles, company websites, or creative portfolios."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We take privacy seriously. Your photos are encrypted, securely stored, and never shared with third parties. You maintain full ownership of your images and can delete them at any time."
    },
    {
      question: "What image formats and resolutions do you support?",
      answer: "We support JPG, PNG, and WebP formats. Generated headshots are provided in high resolution (1024x1024) and are suitable for both digital and print use."
    },
    {
      question: "Can I use these headshots commercially?",
      answer: "Yes, all generated headshots can be used for commercial purposes including business profiles, marketing materials, and professional portfolios. The Business plan includes an extended commercial license."
    },
    {
      question: "What if I'm not satisfied with the results?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with your AI headshots, contact our support team for a full refund."
    },
    {
      question: "Can I edit or customize the generated headshots?",
      answer: "While the AI generates the headshots automatically, you can regenerate with different prompts or styles. For specific edits, we recommend using photo editing software or contacting our support for custom requests."
    },
    {
      question: "Do you offer team or bulk pricing?",
      answer: "Yes! Our Business plan includes team management features. For larger organizations or custom requirements, please contact our sales team for special pricing."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about AI headshot generation
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <span className="text-left font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
              <CardDescription>
                Our support team is here to help you get the perfect headshots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/support">
                  <Button variant="outline">Contact Support</Button>
                </Link>
                <Link to="/">
                  <Button className="bg-brand-600 hover:bg-brand-700">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
