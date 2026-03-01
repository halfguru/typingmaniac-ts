import Phaser from 'phaser';
import { FONT_FAMILY } from '../config/constants';

export type ProgressBarOrientation = 'horizontal' | 'vertical';

export interface ProgressBarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: number;
  glowColor?: number;
  bgColor?: number;
  label?: string;
  labelPosition?: 'top' | 'left' | 'right' | 'bottom';
  showValue?: boolean;
  valuePosition?: 'top' | 'left' | 'right' | 'bottom';
  maxValue?: number;
  orientation?: ProgressBarOrientation;
  style?: 'simple' | 'elaborate';
  animated?: boolean;
}

export class ProgressBar extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private fill: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text | null = null;
  private valueText: Phaser.GameObjects.Text | null = null;
  private config: ProgressBarConfig;
  private currentValue: number = 0;
  private currentTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, config: ProgressBarConfig) {
    super(scene, config.x, config.y);
    this.config = config;

    const bgColor = config.bgColor ?? 0x282828;
    const glowColor = config.glowColor ?? config.fillColor;
    const style = config.style ?? 'simple';

    if (style === 'elaborate') {
      this.createElaborateBackground(scene, config, bgColor, glowColor);
    } else {
      this.createSimpleBackground(scene, config, bgColor, glowColor);
    }

    this.fill = scene.add.graphics();
    this.add(this.fill);

    if (config.label) {
      this.label = this.createLabel(scene, config, glowColor);
      this.add(this.label);
    }

    if (config.showValue) {
      this.valueText = this.createValueText(scene, config, glowColor);
      this.add(this.valueText);
    }

    this.setValue(0);
  }

  private createSimpleBackground(
    scene: Phaser.Scene,
    config: ProgressBarConfig,
    bgColor: number,
    glowColor: number
  ) {
    this.bg = scene.add.graphics();
    this.bg.fillStyle(bgColor, 1);
    this.bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 6);
    this.bg.lineStyle(2, glowColor, 0.3);
    this.bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 6);
    this.add(this.bg);
  }

  private createElaborateBackground(
    scene: Phaser.Scene,
    config: ProgressBarConfig,
    bgColor: number,
    glowColor: number
  ) {
    const { width, height } = config;
    const radius = 8;

    const outerGlow = scene.add.graphics();
    for (let i = 3; i >= 0; i--) {
      outerGlow.fillStyle(glowColor, 0.05 - i * 0.01);
      outerGlow.fillRoundedRect(-width / 2 - 8 - i * 2, -height / 2 - 8 - i * 2, width + 16 + i * 4, height + 16 + i * 4, radius + 8);
    }
    this.add(outerGlow);

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x050a12, 1);
    this.bg.fillRoundedRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8, radius + 4);
    this.bg.fillStyle(bgColor, 1);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    this.bg.lineStyle(2, glowColor, 0.4);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

    for (let i = 1; i < 4; i++) {
      const tickPos = config.orientation === 'vertical' 
        ? -height / 2 + (height / 4) * i 
        : -width / 2 + (width / 4) * i;
      
      this.bg.lineStyle(1, glowColor, 0.15);
      if (config.orientation === 'vertical') {
        this.bg.lineBetween(-width / 2 + 4, tickPos, width / 2 - 4, tickPos);
      } else {
        this.bg.lineBetween(tickPos, -height / 2 + 4, tickPos, height / 2 - 4);
      }
    }
    this.add(this.bg);

    const shine = scene.add.graphics();
    shine.fillStyle(0xffffff, 0.05);
    if (config.orientation === 'vertical') {
      shine.fillRoundedRect(-width / 2 + 3, -height / 2 + 3, width - 6, height / 3, radius - 2);
    } else {
      shine.fillRoundedRect(-width / 2 + 3, -height / 2 + 3, width / 3, height - 6, radius - 2);
    }
    this.add(shine);
  }

  private createLabel(scene: Phaser.Scene, config: ProgressBarConfig, glowColor: number): Phaser.GameObjects.Text {
    const labelPos = config.labelPosition ?? (config.orientation === 'vertical' ? 'top' : 'left');
    let x = 0, y = 0, originX = 0.5, originY = 0.5;

    switch (labelPos) {
      case 'top':
        y = -config.height / 2 - 40;
        break;
      case 'bottom':
        y = config.height / 2 + 20;
        break;
      case 'left':
        x = -config.width / 2 - 10;
        originX = 1;
        break;
      case 'right':
        x = config.width / 2 + 10;
        originX = 0;
        break;
    }

    const label = scene.add.text(x, y, config.label ?? '', {
      fontFamily: FONT_FAMILY,
      fontSize: config.style === 'elaborate' ? '20px' : '14px',
      color: `#${glowColor.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
    });
    label.setOrigin(originX, originY);
    label.setShadow(0, 0, `#${glowColor.toString(16).padStart(6, '0')}`, 6, true, true);
    return label;
  }

  private createValueText(scene: Phaser.Scene, config: ProgressBarConfig, glowColor: number): Phaser.GameObjects.Text {
    const valuePos = config.valuePosition ?? (config.orientation === 'vertical' ? 'bottom' : 'right');
    let x = 0, y = 0, originX = 0.5, originY = 0.5;

    switch (valuePos) {
      case 'top':
        y = -config.height / 2 - 15;
        break;
      case 'bottom':
        y = config.height / 2 + 38;
        break;
      case 'left':
        x = -config.width / 2 - 10;
        originX = 1;
        break;
      case 'right':
        x = config.width / 2 + 10;
        originX = 0;
        break;
    }

    const valueText = scene.add.text(x, y, '0%', {
      fontFamily: FONT_FAMILY,
      fontSize: config.style === 'elaborate' ? '28px' : '14px',
      color: `#${glowColor.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
    });
    valueText.setOrigin(originX, originY);
    if (config.style === 'elaborate') {
      valueText.setShadow(0, 0, `#${glowColor.toString(16).padStart(6, '0')}`, 8, true, true);
    }
    return valueText;
  }

  setValue(value: number, animate: boolean = false) {
    if (animate && this.config.animated !== false) {
      this.animateToValue(value);
      return;
    }

    this.currentValue = value;
    this.drawFill(value);
    this.updateValueText(value);
  }

  private animateToValue(targetValue: number) {
    if (this.currentTween) {
      this.currentTween.stop();
    }

    const isResetting = targetValue === 0 && this.currentValue > 10;
    if (isResetting) {
      this.currentValue = 0;
      this.drawFill(0);
      this.updateValueText(0);
      return;
    }

    const scene = this.scene;
    if (!scene || !scene.tweens) return;

    this.currentTween = scene.tweens.addCounter({
      from: this.currentValue,
      to: targetValue,
      duration: 200,
      ease: 'Power2',
      onUpdate: (tween) => {
        const value = tween.getValue() ?? targetValue;
        this.drawFill(value);
        this.updateValueText(value);
      },
      onComplete: () => {
        this.currentValue = targetValue;
        this.currentTween = null;
      },
    });
  }

  private drawFill(value: number) {
    const { width, height, fillColor, orientation, maxValue } = this.config;
    const max = maxValue ?? 100;
    const pct = Math.min(Math.max(value / max, 0), 1);

    this.fill.clear();
    if (pct < 0.01) return;

    const radius = 6;

    if (orientation === 'vertical') {
      const fillHeight = height * pct;
      const cappedHeight = Math.min(fillHeight, height - 4);
      const fillY = height / 2 - cappedHeight;

      this.fill.fillStyle(fillColor, 1);
      this.fill.fillRoundedRect(-width / 2 + 2, fillY, width - 4, cappedHeight, { tl: radius, tr: radius, bl: 0, br: 0 });

      if (cappedHeight > radius) {
        this.fill.fillRect(-width / 2 + 2, fillY + radius, width - 4, cappedHeight - radius);
      }

      this.fill.fillStyle(0xffffff, 0.2);
      this.fill.fillRect(-width / 2 + 4, fillY + 3, 6, Math.min(cappedHeight - 6, 30));
    } else {
      const fillWidth = width * pct;
      const cappedWidth = Math.min(fillWidth, width - 4);

      this.fill.fillStyle(fillColor, 1);
      this.fill.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, cappedWidth, height - 4, radius);

      this.fill.fillStyle(0xffffff, 0.2);
      this.fill.fillRect(-width / 2 + 4, -height / 2 + 4, Math.min(cappedWidth - 6, 30), 6);
    }
  }

  private updateValueText(value: number) {
    if (!this.valueText) return;
    const max = this.config.maxValue ?? 100;
    const pct = Math.round((value / max) * 100);
    this.valueText.setText(`${pct}%`);
  }

  getValue(): number {
    return this.currentValue;
  }

  setLabel(text: string) {
    if (this.label) {
      this.label.setText(text);
    }
  }

  reset() {
    if (this.currentTween) {
      this.currentTween.stop();
      this.currentTween = null;
    }
    this.currentValue = 0;
    this.drawFill(0);
    this.updateValueText(0);
  }

  destroy(fromScene?: boolean) {
    if (this.currentTween) {
      this.currentTween.stop();
      this.currentTween = null;
    }
    super.destroy(fromScene);
  }
}
