import Phaser from 'phaser';
import { GAME_AREA_WIDTH, GAME_HEIGHT } from '../config/constants';
import { themeService } from './ThemeService';

export class WizardRenderer {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private leftArm!: Phaser.GameObjects.Graphics;
  private rightArm!: Phaser.GameObjects.Graphics;
  private scroll!: Phaser.GameObjects.Graphics;
  private leftEye!: Phaser.GameObjects.Arc;
  private rightEye!: Phaser.GameObjects.Arc;
  private breathePhase = 0;
  private handOffset = 0;
  private readonly centerY = GAME_HEIGHT - 330;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create() {
    const centerX = GAME_AREA_WIDTH / 2;

    this.container = this.scene.add.container(centerX, this.centerY);
    this.container.setDepth(-1);

    this.createBody();
    this.createHood();
    this.createFace();
    this.createEyes();
    this.createBeard();
    this.createScroll();
    this.createArms();
    this.createStaff();

    this.startAnimations();
  }

  private createBody() {
    const body = this.scene.add.graphics();
    const robeColor = themeService.getNumber('character.hood');
    
    body.fillStyle(robeColor, 1);
    body.beginPath();
    body.moveTo(-90, 180);
    body.lineTo(90, 180);
    body.lineTo(70, 0);
    body.lineTo(-70, 0);
    body.closePath();
    body.fillPath();

    const { r, g, b } = Phaser.Display.Color.IntegerToRGB(robeColor);
    body.fillStyle(
      Phaser.Display.Color.GetColor(r + 25, g + 15, b + 5),
      0.5
    );
    body.beginPath();
    body.moveTo(-80, 170);
    body.lineTo(-20, 170);
    body.lineTo(-35, 20);
    body.lineTo(-65, 20);
    body.closePath();
    body.fillPath();
    
    this.container.add(body);
  }

  private createHood() {
    const hood = this.scene.add.graphics();
    const hoodColor = themeService.getNumber('character.hood');
    const { r, g, b } = Phaser.Display.Color.IntegerToRGB(hoodColor);
    const darkHood = Phaser.Display.Color.GetColor(
      Math.max(0, r - 30),
      Math.max(0, g - 20),
      Math.max(0, b - 10)
    );
    
    hood.fillStyle(darkHood, 1);
    hood.beginPath();
    hood.moveTo(-75, 10);
    hood.lineTo(75, 10);
    hood.lineTo(50, -120);
    hood.lineTo(0, -150);
    hood.lineTo(-50, -120);
    hood.closePath();
    hood.fillPath();

    hood.fillStyle(hoodColor, 1);
    hood.beginPath();
    hood.moveTo(-65, 5);
    hood.lineTo(65, 5);
    hood.lineTo(40, -100);
    hood.lineTo(0, -130);
    hood.lineTo(-40, -100);
    hood.closePath();
    hood.fillPath();

    const shadowHood = Phaser.Display.Color.GetColor(
      Math.max(0, r - 40),
      Math.max(0, g - 30),
      Math.max(0, b - 20)
    );
    hood.fillStyle(shadowHood, 0.7);
    hood.beginPath();
    hood.moveTo(-55, 0);
    hood.lineTo(-58, -30);
    hood.lineTo(-50, -55);
    hood.lineTo(-35, -75);
    hood.lineTo(-30, -100);
    hood.lineTo(-40, -70);
    hood.lineTo(-50, -40);
    hood.lineTo(-55, 0);
    hood.closePath();
    hood.fillPath();
    
    this.container.add(hood);
  }

  private createFace() {
    const face = this.scene.add.graphics();
    const skinColor = 0xe8c4a0;
    const skinShadow = 0xd4a574;
    
    face.fillStyle(skinShadow, 1);
    face.fillEllipse(0, -45, 50, 45);
    
    face.fillStyle(skinColor, 1);
    face.fillEllipse(0, -50, 45, 40);

    face.fillStyle(skinShadow, 0.5);
    face.fillEllipse(0, -35, 35, 20);
    
    const nose = this.scene.add.graphics();
    nose.fillStyle(skinShadow, 1);
    nose.beginPath();
    nose.moveTo(0, -45);
    nose.lineTo(-4, -30);
    nose.lineTo(4, -30);
    nose.closePath();
    nose.fillPath();
    
    this.container.add(face);
    this.container.add(nose);
  }

  private createEyes() {
    const eyeColor = themeService.getNumber('character.eyes');
    const glowColor = themeService.getNumber('character.eyesGlow');
    
    const leftEyeOuter = this.scene.add.circle(-15, -55, 8, glowColor, 0.4);
    const rightEyeOuter = this.scene.add.circle(15, -55, 8, glowColor, 0.4);
    
    this.leftEye = this.scene.add.circle(-15, -55, 5, eyeColor, 1);
    this.rightEye = this.scene.add.circle(15, -55, 5, eyeColor, 1);
    
    const leftPupil = this.scene.add.circle(-14, -55, 2, 0x000000, 1);
    const rightPupil = this.scene.add.circle(16, -55, 2, 0x000000, 1);
    
    const leftHighlight = this.scene.add.circle(-13, -57, 1.5, 0xffffff, 0.8);
    const rightHighlight = this.scene.add.circle(17, -57, 1.5, 0xffffff, 0.8);
    
    const browL = this.scene.add.graphics();
    browL.lineStyle(2, 0x4a3020, 1);
    browL.lineBetween(-22, -65, -8, -68);
    
    const browR = this.scene.add.graphics();
    browR.lineStyle(2, 0x4a3020, 1);
    browR.lineBetween(8, -68, 22, -65);
    
    this.container.add(leftEyeOuter);
    this.container.add(rightEyeOuter);
    this.container.add(this.leftEye);
    this.container.add(this.rightEye);
    this.container.add(leftPupil);
    this.container.add(rightPupil);
    this.container.add(leftHighlight);
    this.container.add(rightHighlight);
    this.container.add(browL);
    this.container.add(browR);

    this.scene.tweens.add({
      targets: [leftEyeOuter, rightEyeOuter],
      alpha: { from: 0.4, to: 0.7 },
      scale: { from: 1, to: 1.3 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createBeard() {
    const beard = this.scene.add.graphics();
    const beardColor = 0x8b7355;
    const beardHighlight = 0xa08060;
    
    beard.fillStyle(beardColor, 1);
    beard.beginPath();
    beard.moveTo(-20, -25);
    beard.lineTo(-28, 0);
    beard.lineTo(-25, 25);
    beard.lineTo(-15, 50);
    beard.lineTo(0, 60);
    beard.lineTo(15, 50);
    beard.lineTo(25, 25);
    beard.lineTo(28, 0);
    beard.lineTo(20, -25);
    beard.closePath();
    beard.fillPath();

    beard.fillStyle(beardHighlight, 0.6);
    beard.beginPath();
    beard.moveTo(-15, -20);
    beard.lineTo(-22, 5);
    beard.lineTo(-18, 25);
    beard.lineTo(-10, 40);
    beard.lineTo(0, 45);
    beard.lineTo(5, 35);
    beard.lineTo(-5, 10);
    beard.lineTo(-10, -20);
    beard.closePath();
    beard.fillPath();
    
    beard.lineStyle(1, beardColor, 0.5);
    for (let i = 0; i < 8; i++) {
      const x = -15 + i * 4;
      beard.lineBetween(x, -20, x + (Math.random() - 0.5) * 10, 40 + Math.random() * 15);
    }
    
    this.container.add(beard);
  }

  private createScroll() {
    this.scroll = this.scene.add.graphics();
    this.drawScroll(0);
    this.container.add(this.scroll);
  }

  private drawScroll(wobble: number) {
    this.scroll.clear();
    
    const scrollColor = 0xf5e6d3;
    const scrollShadow = 0xd4c4b0;
    const woodColor = 0x8b4513;
    const woodDark = 0x654321;
    
    this.scroll.fillStyle(scrollShadow, 1);
    this.scroll.fillRoundedRect(-50 + wobble, 75, 100, 70, 8);
    
    this.scroll.fillStyle(scrollColor, 1);
    this.scroll.fillRoundedRect(-45 + wobble, 80, 90, 60, 6);

    this.scroll.lineStyle(1, 0xc4a080, 0.5);
    for (let i = 0; i < 4; i++) {
      const lineY = 90 + i * 12;
      this.scroll.lineBetween(-35 + wobble, lineY, 35 + wobble, lineY);
    }

    this.scroll.fillStyle(woodDark, 1);
    this.scroll.fillCircle(-50 + wobble, 110, 10);
    this.scroll.fillCircle(50 + wobble, 110, 10);
    
    this.scroll.fillStyle(woodColor, 1);
    this.scroll.fillCircle(-50 + wobble, 110, 6);
    this.scroll.fillCircle(50 + wobble, 110, 6);
    
    this.scroll.fillStyle(0xffd700, 0.4);
    this.scroll.fillCircle(-50 + wobble, 110, 3);
    this.scroll.fillCircle(50 + wobble, 110, 3);
  }

  private createArms() {
    this.leftArm = this.scene.add.graphics();
    this.rightArm = this.scene.add.graphics();
    
    this.container.add(this.leftArm);
    this.container.add(this.rightArm);
    
    this.drawArms(0);
  }

  private createStaff() {
    const staff = this.scene.add.graphics();
    const woodColor = 0x654321;
    
    staff.fillStyle(woodColor, 1);
    staff.fillRect(80, -100, 8, 280);
    
    staff.fillStyle(0x8b4513, 0.5);
    staff.fillRect(82, -100, 3, 280);

    const orbGlow = this.scene.add.graphics();
    orbGlow.fillStyle(0xffd700, 0.2);
    orbGlow.fillCircle(84, -120, 25);
    orbGlow.fillStyle(0xffd700, 0.4);
    orbGlow.fillCircle(84, -120, 15);
    orbGlow.fillStyle(0xffaa00, 0.8);
    orbGlow.fillCircle(84, -120, 10);
    orbGlow.fillStyle(0xffd700, 1);
    orbGlow.fillCircle(84, -120, 5);
    
    this.container.add(staff);
    this.container.add(orbGlow);

    this.scene.tweens.add({
      targets: orbGlow,
      scaleX: { from: 1, to: 1.2 },
      scaleY: { from: 1, to: 1.2 },
      alpha: { from: 1, to: 0.7 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawArms(offset: number) {
    const sleeveColor = themeService.getNumber('character.hood');
    const handColor = 0xe8c4a0;
    
    const leftHandY = 90 + offset;
    const rightHandY = 90 - offset;
    
    this.leftArm.clear();
    this.leftArm.fillStyle(sleeveColor, 1);
    this.leftArm.beginPath();
    this.leftArm.moveTo(-70, 20);
    this.leftArm.lineTo(-90, 80);
    this.leftArm.lineTo(-50, 80);
    this.leftArm.lineTo(-50, 20);
    this.leftArm.closePath();
    this.leftArm.fillPath();
    
    this.leftArm.fillStyle(handColor, 1);
    this.leftArm.fillCircle(-70, leftHandY, 14);
    this.leftArm.fillStyle(handColor, 0.9);
    for (let i = 0; i < 4; i++) {
      this.leftArm.fillRect(-80 + i * 6, leftHandY + 10, 4, 12);
    }
    
    this.rightArm.clear();
    this.rightArm.fillStyle(sleeveColor, 1);
    this.rightArm.beginPath();
    this.rightArm.moveTo(50, 20);
    this.rightArm.lineTo(90, 80);
    this.rightArm.lineTo(50, 80);
    this.rightArm.lineTo(70, 20);
    this.rightArm.closePath();
    this.rightArm.fillPath();
    
    this.rightArm.fillStyle(handColor, 1);
    this.rightArm.fillCircle(70, rightHandY, 14);
    this.rightArm.fillStyle(handColor, 0.9);
    for (let i = 0; i < 4; i++) {
      this.rightArm.fillRect(56 + i * 6, rightHandY + 10, 4, 12);
    }
  }

  private startAnimations() {
    this.scene.events.on('update', this.onUpdate, this);
  }

  private onUpdate(_time: number, delta: number) {
    this.breathePhase += delta * 0.002;
    
    const breathe = Math.sin(this.breathePhase) * 0.012;
    this.container.setScale(1 + breathe, 1 - breathe * 0.5);
    this.container.setPosition(
      GAME_AREA_WIDTH / 2 + Math.sin(this.breathePhase * 0.5) * 2,
      this.centerY
    );
    
    if (this.handOffset !== 0) {
      this.handOffset *= 0.85;
      if (Math.abs(this.handOffset) < 0.5) this.handOffset = 0;
      this.drawArms(this.handOffset);
    }
  }

  onTyping() {
    this.handOffset = 15;
    this.drawArms(this.handOffset);
    
    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scaleX: { from: 1, to: 1.2 },
      scaleY: { from: 1, to: 0.8 },
      duration: 50,
      yoyo: true,
    });
  }

  onWordSuccess() {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 0.95 },
      duration: 100,
      yoyo: true,
      repeat: 1,
    });

    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scaleX: { from: 1, to: 1.4 },
      scaleY: { from: 1, to: 0.6 },
      duration: 100,
      yoyo: true,
    });

    this.handOffset = 25;
    this.drawArms(this.handOffset);
    
    this.scene.time.delayedCall(150, () => {
      this.handOffset = -25;
      this.drawArms(this.handOffset);
    });
  }

  onWordFail() {
    this.scene.tweens.add({
      targets: this.container,
      x: GAME_AREA_WIDTH / 2 - 15,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scaleX: { from: 1, to: 0.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 100,
      yoyo: true,
    });

    const dangerColor = 0xff4444;
    const originalColor = this.leftEye.fillColor;
    this.leftEye.setFillStyle(dangerColor);
    this.rightEye.setFillStyle(dangerColor);
    
    this.scene.time.delayedCall(300, () => {
      this.leftEye.setFillStyle(originalColor);
      this.rightEye.setFillStyle(originalColor);
    });
  }

  destroy() {
    this.scene.events.off('update', this.onUpdate, this);
    this.container?.destroy();
  }
}
