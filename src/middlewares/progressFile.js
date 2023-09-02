// Middleware para emitir eventos de progreso
const progressMiddleware = (req, res, next) => {
    res.progress = (currentProgress) => {
      const progressPercentage = Math.min(Math.max(currentProgress, 0), 100);
      res.write(`data: ${progressPercentage}\n\n`);
    };
    next();
  };

  export default progressMiddleware