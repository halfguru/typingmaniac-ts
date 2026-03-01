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
    this.createDesk();

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

    face.fillStyle(skinShadow, 0.3);
    face.fillEllipse(0, -40, 25, 12);
    
    const nose = this.scene.add.graphics();
    nose.fillStyle(skinShadow, 1);
    nose.beginPath();
    nose.moveTo(0, -52);
    nose.lineTo(-5, -35);
    nose.lineTo(5, -35);
    nose.closePath();
    nose.fillPath();
    
    nose.fillStyle(skinColor, 0.7);
    nose.beginPath();
    nose.moveTo(0, -52);
    nose.lineTo(-2, -38);
    nose.lineTo(2, -38);
    nose.closePath();
    nose.fillPath();
    
    const nostrils = this.scene.add.graphics();
    nostrils.fillStyle(0x8b6914, 0.6);
    nostrils.fillEllipse(-3, -36, 2, 1.5);
    nostrils.fillEllipse(3, -36, 2, 1.5);
    
    this.container.add(face);
    this.container.add(nose);
    this.container.add(nostrils);
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
    beard.moveTo(-22, -32);
    beard.lineTo(-26, -20);
    beard.lineTo(-28, 0);
    beard.lineTo(-25, 25);
    beard.lineTo(-15, 50);
    beard.lineTo(0, 60);
    beard.lineTo(15, 50);
    beard.lineTo(25, 25);
    beard.lineTo(28, 0);
    beard.lineTo(26, -20);
    beard.lineTo(22, -32);
    beard.lineTo(0, -28);
    beard.closePath();
    beard.fillPath();
    
    beard.fillStyle(beardHighlight, 0.5);
    beard.beginPath();
    beard.moveTo(-15, -28);
    beard.lineTo(-20, -10);
    beard.lineTo(-18, 10);
    beard.lineTo(-12, 35);
    beard.lineTo(0, 42);
    beard.lineTo(6, 30);
    beard.lineTo(0, 5);
    beard.lineTo(-8, -15);
    beard.lineTo(-10, -28);
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
    const inkColor = 0x1a1a1a;
    
    this.scroll.fillStyle(woodDark, 0.5);
    this.scroll.fillEllipse(0 + wobble * 0.5, 120, 75, 18);
    
    this.scroll.fillStyle(woodDark, 1);
    this.scroll.fillEllipse(-55 + wobble, 105, 12, 8);
    this.scroll.fillEllipse(55 + wobble, 105, 12, 8);
    
    this.scroll.fillStyle(woodColor, 1);
    this.scroll.fillEllipse(-55 + wobble, 105, 8, 5);
    this.scroll.fillEllipse(55 + wobble, 105, 8, 5);
    
    this.scroll.fillStyle(0xffd700, 0.5);
    this.scroll.fillEllipse(-55 + wobble, 104, 4, 2);
    this.scroll.fillEllipse(55 + wobble, 104, 4, 2);
    
    this.scroll.fillStyle(scrollShadow, 1);
    this.scroll.fillEllipse(0 + wobble, 103, 70, 20);
    
    this.scroll.fillStyle(scrollColor, 1);
    this.scroll.fillEllipse(0 + wobble, 102, 65, 18);
    
    this.scroll.lineStyle(1, inkColor, 0.25);
    for (let i = 0; i < 4; i++) {
      const lineY = 97 + i * 4;
      this.scroll.lineBetween(-45 + wobble, lineY, 45 + wobble, lineY);
    }
    
    this.scroll.fillStyle(0xffd700, 0.15);
    this.scroll.fillEllipse(-20 + wobble, 98, 20, 3);
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
    const woodColor = 0x5a3d2b;
    const woodLight = 0x7a5d4b;
    const goldColor = 0xc9a227;
    const goldHighlight = 0xffd700;

    staff.fillStyle(woodColor, 1);
    staff.fillRoundedRect(80, -85, 10, 265, 3);
    
    staff.fillStyle(woodLight, 0.6);
    staff.fillRect(82, -85, 4, 265);

    for (let i = 0; i < 8; i++) {
      const y = -70 + i * 35;
      staff.lineStyle(1, woodLight, 0.3);
      staff.beginPath();
      staff.moveTo(81, y);
      staff.lineTo(89, y + 10);
      staff.strokePath();
    }

    const bands = [-80, 50, 150];
    bands.forEach((y, i) => {
      staff.fillStyle(goldColor, 1);
      staff.fillRoundedRect(78, y, 14, 8, 2);
      staff.fillStyle(goldHighlight, 0.5);
      staff.fillRect(80, y + 1, 3, 6);
      
      if (i === 1) {
        staff.fillStyle(0x4a0080, 0.9);
        staff.fillCircle(85, y + 4, 3);
        staff.fillStyle(0x9b30ff, 0.8);
        staff.fillCircle(84, y + 3, 1.5);
      }
    });

    const orbHolder = this.scene.add.graphics();
    
    orbHolder.fillStyle(goldColor, 1);
    orbHolder.fillRoundedRect(74, -75, 20, 10, 3);
    orbHolder.fillStyle(goldHighlight, 0.4);
    orbHolder.fillRect(76, -74, 4, 8);
    
    orbHolder.lineStyle(4, goldColor, 1);
    orbHolder.beginPath();
    orbHolder.arc(84, -75, 18, Math.PI, 0, false);
    orbHolder.strokePath();
    
    orbHolder.lineStyle(3, goldHighlight, 0.5);
    orbHolder.beginPath();
    orbHolder.arc(84, -75, 16, Math.PI, 0, false);
    orbHolder.strokePath();

    const numRibs = 5;
    for (let i = 0; i < numRibs; i++) {
      const angleOffset = (i / (numRibs - 1)) * Math.PI - Math.PI / 2;
      const startX = 84 + Math.cos(angleOffset) * 18;
      const startY = -75 + Math.sin(angleOffset) * 18;
      const endX = 84 + Math.cos(angleOffset) * 28;
      const endY = -75 + Math.sin(angleOffset) * 28 - 5;
      
      orbHolder.lineStyle(3, goldColor, 1);
      orbHolder.beginPath();
      orbHolder.moveTo(startX, startY);
      orbHolder.lineTo(endX, endY);
      orbHolder.strokePath();
      
      orbHolder.fillStyle(goldColor, 1);
      orbHolder.fillCircle(endX, endY, 3);
      orbHolder.fillStyle(goldHighlight, 0.6);
      orbHolder.fillCircle(endX - 1, endY - 1, 1.5);
    }

    orbHolder.lineStyle(3, goldColor, 1);
    orbHolder.beginPath();
    orbHolder.arc(84, -80, 28, Math.PI * 1.2, Math.PI * 1.8, false);
    orbHolder.strokePath();

    const orbContainer = this.scene.add.container(84, -95);
    
    const orbGlow = this.scene.add.graphics();
    orbGlow.fillStyle(0xffd700, 0.15);
    orbGlow.fillCircle(0, 0, 25);
    orbGlow.fillStyle(0xffd700, 0.25);
    orbGlow.fillCircle(0, 0, 18);
    orbGlow.fillStyle(0xffd700, 0.4);
    orbGlow.fillCircle(0, 0, 12);
    orbGlow.fillStyle(0xffaa00, 0.8);
    orbGlow.fillCircle(0, 0, 8);
    orbGlow.fillStyle(0xffd700, 1);
    orbGlow.fillCircle(0, 0, 5);
    orbGlow.fillStyle(0xffffff, 0.9);
    orbGlow.fillCircle(-1.5, -1.5, 1.5);

    orbContainer.add(orbGlow);
    
    this.container.add(staff);
    this.container.add(orbHolder);
    this.container.add(orbContainer);

    this.scene.tweens.add({
      targets: orbContainer,
      scaleX: { from: 1, to: 1.15 },
      scaleY: { from: 1, to: 1.15 },
      alpha: { from: 1, to: 0.8 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const particles = this.scene.add.graphics();
    this.container.add(particles);
    
    const particleData = Array.from({ length: 6 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 20 + Math.random() * 15,
      speed: 0.005 + Math.random() * 0.01,
      size: 1 + Math.random() * 2,
    }));

    this.scene.tweens.addCounter({
      from: 0,
      to: 360,
      duration: 3000,
      repeat: -1,
      onUpdate: (tween) => {
        particles.clear();
        const time = (tween.getValue() ?? 0) * Math.PI / 180;
        
        particleData.forEach((p) => {
          const currentAngle = p.angle + time * p.speed * 100;
          const x = 84 + Math.cos(currentAngle) * p.radius;
          const y = -95 + Math.sin(currentAngle) * p.radius * 0.5;
          const alpha = 0.3 + Math.sin(time * 2 + p.angle) * 0.3;
          
          particles.fillStyle(0xffd700, alpha);
          particles.fillCircle(x, y, p.size);
        });
      },
    });
  }

  private createDesk() {
    const desk = this.scene.add.graphics();
    const woodDark = 0x2a1a0a;
    const woodMid = 0x4a3020;
    const woodLight = 0x6a4530;
    const woodHighlight = 0x8a6050;
    
    desk.fillStyle(woodMid, 1);
    desk.fillRoundedRect(-200, 115, 400, 45, 5);
    
    desk.fillStyle(woodLight, 1);
    desk.fillRect(-198, 115, 396, 10);
    
    desk.fillStyle(woodHighlight, 0.5);
    desk.fillRect(-195, 117, 390, 4);
    
    desk.lineStyle(2, woodDark, 0.6);
    for (let i = 0; i < 8; i++) {
      const x = -180 + i * 50;
      desk.lineBetween(x, 118, x, 158);
    }
    
    desk.fillStyle(woodDark, 1);
    desk.fillRoundedRect(-200, 160, 400, 55, { tl: 0, tr: 0, bl: 5, br: 5 });
    
    desk.fillStyle(woodMid, 0.7);
    desk.fillRect(-195, 165, 390, 45);
    
    desk.fillStyle(woodHighlight, 0.3);
    desk.fillRect(-195, 165, 390, 5);
    
    desk.lineStyle(2, woodDark, 0.5);
    desk.lineBetween(0, 160, 0, 215);
    
    desk.fillStyle(woodLight, 0.8);
    desk.fillRoundedRect(-170, 175, 70, 30, 3);
    desk.fillRoundedRect(100, 175, 70, 30, 3);
    
    desk.fillStyle(woodDark, 0.6);
    desk.fillCircle(-135, 190, 4);
    desk.fillCircle(135, 190, 4);
    
    desk.fillStyle(woodDark, 1);
    desk.fillRoundedRect(-210, 215, 25, 80, 2);
    desk.fillRoundedRect(185, 215, 25, 80, 2);
    
    desk.fillStyle(woodMid, 0.6);
    desk.fillRect(-208, 217, 21, 76);
    desk.fillRect(187, 217, 21, 76);
    
    const items = this.scene.add.graphics();
    
    items.fillStyle(0x8b0000, 1);
    items.fillRoundedRect(-160, 95, 50, 22, 3);
    items.fillStyle(0xa52a2a, 0.7);
    items.fillRect(-158, 97, 46, 7);
    
    items.fillStyle(0xf5e6c8, 1);
    items.fillRoundedRect(120, 100, 60, 18, 2);
    items.fillStyle(0xe8d4b0, 0.6);
    items.fillRect(122, 102, 56, 6);
    items.lineStyle(1, 0x8b4513, 0.5);
    items.lineBetween(130, 105, 170, 105);
    items.lineBetween(130, 110, 160, 110);
    
    items.fillStyle(0xc9a227, 1);
    items.fillCircle(-80, 105, 8);
    items.fillStyle(0xffd700, 0.5);
    items.fillCircle(-82, 103, 3);
    
    items.fillStyle(0x4a2c00, 1);
    items.fillRoundedRect(50, 90, 25, 28, 2);
    items.fillStyle(0x6a4c20, 0.6);
    items.fillRect(52, 92, 21, 9);
    
    const quill = this.scene.add.graphics();
    const featherWhite = 0xf0f0f0;
    const featherGray = 0xc0c0c0;
    const quillBrown = 0x8b4513;
    
    quill.fillStyle(featherWhite, 1);
    quill.beginPath();
    quill.moveTo(-50, 85);
    quill.lineTo(-80, 35);
    quill.lineTo(-75, 37);
    quill.lineTo(-45, 80);
    quill.closePath();
    quill.fillPath();
    
    quill.fillStyle(featherGray, 0.6);
    quill.beginPath();
    quill.moveTo(-65, 65);
    quill.lineTo(-77, 40);
    quill.lineTo(-73, 43);
    quill.lineTo(-60, 63);
    quill.closePath();
    quill.fillPath();
    
    quill.lineStyle(1, featherGray, 0.7);
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const x1 = -75 + t * 25;
      const y1 = 40 + t * 35;
      quill.lineBetween(x1, y1, x1 - 5 - i * 2, y1 - 15 - i * 3);
    }
    
    quill.fillStyle(quillBrown, 1);
    quill.beginPath();
    quill.moveTo(-50, 85);
    quill.lineTo(-47, 100);
    quill.lineTo(-49, 110);
    quill.lineTo(-51, 110);
    quill.lineTo(-53, 100);
    quill.lineTo(-50, 85);
    quill.closePath();
    quill.fillPath();
    
    quill.fillStyle(0x1a1a1a, 1);
    quill.fillTriangle(-50, 110, -52, 117, -48, 117);
    
    const inkwell = this.scene.add.graphics();
    inkwell.fillStyle(0x1a1a2e, 1);
    inkwell.fillRoundedRect(-110, 95, 20, 20, 3);
    inkwell.fillStyle(0x0d0d15, 1);
    inkwell.fillEllipse(-100, 97, 10, 4);
    inkwell.fillStyle(0x2a2a4e, 0.5);
    inkwell.fillRect(-108, 96, 6, 3);
    
    this.container.add(desk);
    this.container.add(items);
    this.container.add(quill);
    this.container.add(inkwell);
  }

  private drawArms(offset: number) {
    const sleeveColor = themeService.getNumber('character.hood');
    const handColor = 0xe8c4a0;
    const handShadow = 0xd4a574;
    
    const leftHandY = 90 + offset;
    const rightHandY = 90 - offset;
    
    this.leftArm.clear();
    this.leftArm.fillStyle(sleeveColor, 1);
    this.leftArm.beginPath();
    this.leftArm.moveTo(-70, 20);
    this.leftArm.lineTo(-95, 75);
    this.leftArm.lineTo(-50, 75);
    this.leftArm.lineTo(-50, 20);
    this.leftArm.closePath();
    this.leftArm.fillPath();
    
    this.leftArm.fillStyle(handColor, 1);
    this.leftArm.beginPath();
    this.leftArm.moveTo(-85, leftHandY);
    this.leftArm.lineTo(-88, leftHandY + 5);
    this.leftArm.lineTo(-52, leftHandY + 5);
    this.leftArm.lineTo(-55, leftHandY);
    this.leftArm.closePath();
    this.leftArm.fillPath();
    
    this.leftArm.fillStyle(handShadow, 0.4);
    this.leftArm.beginPath();
    this.leftArm.arc(-70, leftHandY, 15, 0, Math.PI);
    this.leftArm.fillPath();
    
    this.leftArm.fillStyle(handColor, 1);
    this.leftArm.fillCircle(-70, leftHandY, 15);
    
    this.leftArm.fillStyle(handShadow, 0.3);
    this.leftArm.fillCircle(-75, leftHandY - 3, 4);
    
    const leftFingerBases = [-82, -75, -67, -60];
    const leftFingerLens = [16, 18, 17, 14];
    const leftFingerWidths = [5, 6, 6, 5];
    
    leftFingerBases.forEach((baseX, i) => {
      const len = leftFingerLens[i];
      const w = leftFingerWidths[i];
      const curve = (i - 1.5) * 3;
      
      this.leftArm.fillStyle(handColor, 1);
      this.leftArm.beginPath();
      this.leftArm.moveTo(baseX - w/2, leftHandY + 12);
      this.leftArm.lineTo(baseX - w/2 + curve/2, leftHandY + 12 + len);
      this.leftArm.lineTo(baseX + w/2 + curve/2, leftHandY + 12 + len);
      this.leftArm.lineTo(baseX + w/2, leftHandY + 12);
      this.leftArm.closePath();
      this.leftArm.fillPath();
      
      this.leftArm.fillStyle(handShadow, 0.3);
      this.leftArm.fillCircle(baseX + curve/2, leftHandY + 12 + len, w/2 + 1);
      
      this.leftArm.lineStyle(0.5, handShadow, 0.4);
      this.leftArm.lineBetween(baseX - 1, leftHandY + 12, baseX - 1 + curve/3, leftHandY + 12 + len - 2);
    });
    
    this.leftArm.fillStyle(handColor, 0.95);
    this.leftArm.beginPath();
    this.leftArm.moveTo(-88, leftHandY + 5);
    this.leftArm.lineTo(-92, leftHandY + 20);
    this.leftArm.lineTo(-85, leftHandY + 22);
    this.leftArm.lineTo(-82, leftHandY + 12);
    this.leftArm.closePath();
    this.leftArm.fillPath();
    
    this.rightArm.clear();
    this.rightArm.fillStyle(sleeveColor, 1);
    this.rightArm.beginPath();
    this.rightArm.moveTo(50, 20);
    this.rightArm.lineTo(95, 75);
    this.rightArm.lineTo(50, 75);
    this.rightArm.lineTo(70, 20);
    this.rightArm.closePath();
    this.rightArm.fillPath();
    
    this.rightArm.fillStyle(handColor, 1);
    this.rightArm.beginPath();
    this.rightArm.moveTo(55, rightHandY);
    this.rightArm.lineTo(52, rightHandY + 5);
    this.rightArm.lineTo(88, rightHandY + 5);
    this.rightArm.lineTo(85, rightHandY);
    this.rightArm.closePath();
    this.rightArm.fillPath();
    
    this.rightArm.fillStyle(handShadow, 0.4);
    this.rightArm.beginPath();
    this.rightArm.arc(70, rightHandY, 15, 0, Math.PI);
    this.rightArm.fillPath();
    
    this.rightArm.fillStyle(handColor, 1);
    this.rightArm.fillCircle(70, rightHandY, 15);
    
    this.rightArm.fillStyle(handShadow, 0.3);
    this.rightArm.fillCircle(65, rightHandY - 3, 4);
    
    const rightFingerBases = [58, 65, 73, 80];
    const rightFingerLens = [16, 18, 17, 14];
    const rightFingerWidths = [5, 6, 6, 5];
    
    rightFingerBases.forEach((baseX, i) => {
      const len = rightFingerLens[i];
      const w = rightFingerWidths[i];
      const curve = (i - 1.5) * -3;
      
      this.rightArm.fillStyle(handColor, 1);
      this.rightArm.beginPath();
      this.rightArm.moveTo(baseX - w/2, rightHandY + 12);
      this.rightArm.lineTo(baseX - w/2 + curve/2, rightHandY + 12 + len);
      this.rightArm.lineTo(baseX + w/2 + curve/2, rightHandY + 12 + len);
      this.rightArm.lineTo(baseX + w/2, rightHandY + 12);
      this.rightArm.closePath();
      this.rightArm.fillPath();
      
      this.rightArm.fillStyle(handShadow, 0.3);
      this.rightArm.fillCircle(baseX + curve/2, rightHandY + 12 + len, w/2 + 1);
      
      this.rightArm.lineStyle(0.5, handShadow, 0.4);
      this.rightArm.lineBetween(baseX + 1, rightHandY + 12, baseX + 1 + curve/3, rightHandY + 12 + len - 2);
    });
    
    this.rightArm.fillStyle(handColor, 0.95);
    this.rightArm.beginPath();
    this.rightArm.moveTo(88, rightHandY + 5);
    this.rightArm.lineTo(92, rightHandY + 20);
    this.rightArm.lineTo(85, rightHandY + 22);
    this.rightArm.lineTo(82, rightHandY + 12);
    this.rightArm.closePath();
    this.rightArm.fillPath();
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
