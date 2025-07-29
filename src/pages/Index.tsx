
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ConnectTheDotsBackground from "@/components/ConnectTheDotsBackground";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7
    }
  }
};

const Index = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated Connect-the-Dots Background */}
      <ConnectTheDotsBackground />
      {/* Navigation */}
      <motion.nav
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
        variants={fadeUp}
        className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-xl border-b border-blue-100 shadow-md z-10 relative"
      >
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600 drop-shadow-lg" />
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">FamilyConnect</span>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-semibold w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-bold shadow-lg w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div
        className="container mx-auto px-6 py-20 relative z-10"
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
        variants={fadeUp}
      >
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          variants={fadeUp}
        >
          <motion.h1
            className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow-xl"
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "visible"}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
          >
            Bridge the Gap Between
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"> Parents & Children</span>
          </motion.h1>
          <motion.p
            className="text-2xl text-gray-900 mb-8 leading-relaxed font-bold drop-shadow-lg"
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "visible"}
            variants={fadeUp}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            An AI-powered family communication platform that helps parents and children 
            understand each other better through guided conversations and personalized insights.
          </motion.p>
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "visible"}
            variants={fadeUp}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white px-6 sm:px-10 py-5 text-lg sm:text-2xl font-bold shadow-xl rounded-full">
                <span className="hidden sm:inline">Start Your Journey</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Quote Section */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16 px-8 py-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-100"
          initial={shouldReduceMotion ? undefined : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <blockquote className="text-2xl font-medium text-gray-800 mb-4 italic leading-relaxed">
            "The single biggest problem in communication is the illusion that it has taken place."
          </blockquote>
          <cite className="text-lg text-gray-600 font-semibold">— George Bernard Shaw</cite>
          <motion.div 
            className="mt-6 pt-6 border-t border-blue-200"
            initial={shouldReduceMotion ? undefined : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              ➤ "FamilyConnect ends the illusion and starts real understanding."
            </p>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={shouldReduceMotion ? undefined : "hidden"}
              whileInView={shouldReduceMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl hover:shadow-3xl transition-all duration-300 rounded-3xl">
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${i === 0 ? 'bg-blue-200' : i === 1 ? 'bg-green-200' : 'bg-purple-200'}`}>
                    {i === 0 && <MessageCircle className="h-8 w-8 text-blue-600" />}
                    {i === 1 && <Users className="h-8 w-8 text-green-600" />}
                    {i === 2 && <Heart className="h-8 w-8 text-purple-600" />}
                  </div>
                  <CardTitle className="text-2xl text-gray-900 font-bold">
                    {i === 0 && "Guided Conversations"}
                    {i === 1 && "Personalized Insights"}
                    {i === 2 && "Stronger Bonds"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 text-center leading-relaxed font-medium">
                    {i === 0 && "Our AI facilitates meaningful conversations between family members, asking the right questions to uncover deeper understanding."}
                    {i === 1 && "Receive tailored recommendations and insights based on your family's unique communication patterns and preferences."}
                    {i === 2 && "Build deeper connections through improved understanding, better communication, and shared activities tailored to your family."}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          className="text-center mb-20"
          initial={shouldReduceMotion ? undefined : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12 drop-shadow-lg">How FamilyConnect Works</h2>
          <div className="grid md:grid-cols-4 gap-10">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? undefined : "hidden"}
                whileInView={shouldReduceMotion ? undefined : "visible"}
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">{i + 1}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    {i === 0 && "Register Together"}
                    {i === 1 && "Join Conversation"}
                    {i === 2 && "Get Insights"}
                    {i === 3 && "Improve Together"}
                  </h3>
                  <p className="text-gray-700 text-base">
                    {i === 0 && "Parent and child create linked accounts"}
                    {i === 1 && "Participate in guided discussions together"}
                    {i === 2 && "AI analyzes responses and identifies patterns"}
                    {i === 3 && "Follow personalized recommendations"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center bg-white/70 backdrop-blur-2xl rounded-3xl p-16 shadow-2xl z-10 relative border border-blue-100"
          initial={shouldReduceMotion ? undefined : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to Strengthen Your Family Bond?</h2>
          <p className="text-2xl text-gray-700 mb-8">Join thousands of families who are already communicating better.</p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white px-6 sm:px-10 py-5 text-lg sm:text-2xl font-bold shadow-xl rounded-full">
              <span className="hidden sm:inline">Start Your Journey</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="bg-gray-900/90 text-white py-12 relative z-10"
        initial={shouldReduceMotion ? undefined : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">FamilyConnect</span>
          </div>
          <p className="text-gray-400">Bringing families closer, one conversation at a time.</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
