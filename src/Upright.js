class Upright {
    constructor(ctx, x, y, width, height, slotCount, slotSpacing, slotWidth, slotDepth) {
      this.ctx = ctx;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.slotCount = slotCount;
      this.slotSpacing = slotSpacing;
      this.slotWidth = slotWidth;
      this.slotDepth = slotDepth;
    }
  
    draw() {
      let currentX = this.x;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y); // Start at the top left of the rectangle
  
      // Top edge with slots
      for (let i = 0; i < this.slotCount; i++) {
        currentX += this.slotSpacing;
        this.ctx.lineTo(currentX, this.y); // Move to slot start
        this.ctx.lineTo(currentX, this.y + this.slotDepth); // Down into slot
        currentX += this.slotWidth;
        this.ctx.lineTo(currentX, this.y + this.slotDepth); // Across slot
        this.ctx.lineTo(currentX, this.y); // Up out of slot
      }
  
      // Complete the rectangle
      this.ctx.lineTo(this.x + this.width, this.y); // Complete the top edge to the right corner
      this.ctx.lineTo(this.x + this.width, this.y + this.height); // Right edge
      this.ctx.lineTo(this.x, this.y + this.height); // Bottom edge
      this.ctx.lineTo(this.x, this.y); // Left edge, back to start
      this.ctx.stroke();
    }

    drawSVG() {
      let currentX = this.x;
      let y = this.y;
  
      // Constructing the path for each upright
      let pathData = `M${currentX} ${y} `; // Start at the top left of the first upright
  
      // Top edge with slots
      for (let i = 0; i < this.slotCount; i++) {
        currentX += this.slotSpacing;
        pathData += `L${currentX} ${y} `; // Move to slot start
        pathData += `L${currentX} ${y + this.slotDepth} `; // Down into slot
        currentX += this.slotWidth;
        pathData += `L${currentX} ${y + this.slotDepth} `; // Across slot
        pathData += `L${currentX} ${y} `; // Up out of slot
      }
  
      // Completing the rectangle's path
      pathData += `L${this.x + this.width} ${y} `; // Move to the top right corner
      pathData += `L${this.x + this.width} ${y + this.height} `; // Down to bottom right
      pathData += `L${this.x} ${y + this.height} `; // Move to bottom left
      pathData += `L${this.x} ${y} `; // Close path back to start
  
      return `<path d="${pathData}" fill="none" stroke="black" stroke-width="${1 / (1 ** 2)}"/>`;
    }

    

  }

export default Upright;