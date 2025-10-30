import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroProps {
  onStartChat: () => void;
}

const Hero = ({ onStartChat }: HeroProps) => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(13,10,37,0.85) 50%, rgba(20,10,45,0.8) 100%), url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-purple-950/20 to-indigo-950/30 animate-gradient-shift bg-300%"></div>
      
      {/* Geometric patterns overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 border border-vibranium-purple/30 rotate-45 animate-float"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 border border-vibranium-blue/40 rotate-12" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-vibranium-glow/20 -rotate-45 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-8 animate-fade-in-up">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 blur-xl opacity-60 bg-gradient-vibranium rounded-full"></div>
              <div className="relative text-6xl sm:text-7xl lg:text-8xl vibranium-glow">
                💬
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block text-foreground mb-2">Converse with</span>
            <span className="block bg-gradient-to-r from-vibranium-blue via-vibranium-purple to-vibranium-glow bg-clip-text text-transparent text-glow">
              Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your AI assistant powered by generative reasoning
          </p>

          {/* CTA Button */}
          <div className="pt-8">
            <Button
              onClick={onStartChat}
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-vibranium hover:opacity-90 transition-all duration-300 vibranium-glow hover:scale-105 rounded-full"
            >
              Start Chatting
            </Button>
          </div>

          {/* Decorative line */}
          <div className="pt-12 flex justify-center">
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-vibranium-purple to-transparent animate-glow-pulse"></div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
