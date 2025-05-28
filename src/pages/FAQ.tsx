
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = [
    {
      question: "How does AI headshot generation work?",
      answer: "Our AI technology analyzes your uploaded photos to learn your unique facial features, then generates professional headshots in various styles. The process takes about 20-30 minutes for training, after which you can generate unlimited headshots instantly."
    },
    {
      question: "What types of photos should I upload?",
      answer: "Upload at least 5 clear, high-quality photos of yourself from different angles. Make sure the photos show your face clearly with good lighting. Avoid sunglasses, hats, or heavy filters for best results."
    },
    {
      question: "How long does the training process take?",
      answer: "The AI model training typically takes 20-30 minutes. You'll receive an email notification when your model is ready to use."
    },
    {
      question: "Can I generate multiple styles of headshots?",
      answer: "Yes! Once your AI model is trained, you can generate headshots in various professional styles including corporate, creative, casual, and more."
    },
    {
      question: "What image quality can I expect?",
      answer: "Our AI generates high-resolution images suitable for professional use, including LinkedIn profiles, company websites, resumes, and marketing materials."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We take privacy seriously. Your photos are encrypted and stored securely. We never share your images with third parties, and you can delete your data at any time."
    },
    {
      question: "Can I use the headshots commercially?",
      answer: "Yes, you have full commercial rights to use the generated headshots for any purpose, including business use, marketing, and social media."
    },
    {
      question: "What if I'm not satisfied with the results?",
      answer: "We offer a satisfaction guarantee. If you're not happy with your results, contact our support team and we'll work to make it right or provide a refund."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, contact us within 30 days for a full refund."
    },
    {
      question: "Can I train multiple AI models?",
      answer: "Yes, depending on your plan, you can train multiple AI models. This is useful if you want different styles or if multiple people need headshots."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about AI Headshots
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Still have questions?</CardTitle>
            <CardDescription>
              Can't find the answer you're looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center space-x-4">
              <Link to="/support">
                <Button>Contact Support</Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="outline">Get Started</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
