const CyberBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 scan-line pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-neon-cyan/10 to-transparent" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-neon-purple/10 to-transparent" />
      <div className="absolute top-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-neon-green/5 to-transparent" />
    </div>
  );
};

export default CyberBackground;
