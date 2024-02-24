class Shelf {
  constructor(
    upright,
    unitSize,
    overhangFront,
    overhangSides,
    widthbetweenUprights,
  ) {
    this.upright = upright;
    this.unitSize = unitSize;
    this.overhangFront = overhangFront;
    this.overhangSides = overhangSides;
    this.widthbetweenUprights = widthbetweenUprights;
    this.numSlots = unitSize + 1
    this.shelfSlotDepth = upright.height - upright.slotDepth;
    }


  draw(ctx, startX, startY) {
    // Starting X and Y coordinates of the shelf
    const shelfWidth = 2 * this.overhangSides + this.widthbetweenUprights * (this.unitSize);
    const shelfHeight = this.upright.height + this.overhangFront; // Example shelf height calculation

    ctx.beginPath();
    ctx.rect(startX, startY, shelfWidth, shelfHeight);
    ctx.stroke(); // Draw shelf rectangle

    // Draw slots on the shelf
    for (let i = 0; i < this.numSlots; i++) {
      let slotX = startX + this.overhangSides + (i * this.widthbetweenUprights) - (this.upright.slotWidth / 2);
      let slotY = startY;

      // Draw each slot as a small rectangle for simplicity
      ctx.beginPath();
      ctx.rect(slotX, slotY, this.upright.slotWidth, this.shelfSlotDepth);
      ctx.stroke();
    }
  }
}

export default Shelf;
