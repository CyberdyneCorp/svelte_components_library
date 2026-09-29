/**
 * Fixed-capacity windows over *committed* bars. Window indicators combine them
 * with the pending bar, so a window of `period` bars is `capacity = period - 1`
 * committed values plus the pending one (capacity 0 for period 1).
 */

/**
 * Running sum, linearly weighted sum (oldest weight 1 … newest weight `count`)
 * and sum of squared deviations (M2) of the last `capacity` values, updated in
 * O(1) per push. M2 uses the Welford / sliding-window update, which avoids the
 * catastrophic cancellation of `Σx² − (Σx)²/n` at large prices. All three are
 * recomputed exactly every `capacity` pushes (amortised O(1)) so float drift
 * cannot accumulate over long series.
 */
export class RollingWindow {
  readonly capacity: number;
  count = 0;
  sum = 0;
  weightedSum = 0;
  m2 = 0;
  private readonly values: Float64Array;
  private oldest = 0;
  private sinceRebuild = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.values = new Float64Array(capacity);
  }

  get full(): boolean {
    return this.count === this.capacity;
  }

  get mean(): number {
    return this.count === 0 ? 0 : this.sum / this.count;
  }

  push(value: number): void {
    if (this.capacity === 0) return;
    if (this.full) this.replaceOldest(value);
    else this.append(value);
    this.sinceRebuild++;
    if (this.sinceRebuild >= this.capacity) this.rebuild();
  }

  private append(value: number): void {
    const meanBefore = this.mean;
    this.values[(this.oldest + this.count) % this.capacity] = value;
    this.count++;
    this.sum += value;
    this.weightedSum += this.count * value;
    this.m2 += (value - meanBefore) * (value - this.mean);
  }

  private replaceOldest(value: number): void {
    const dropped = this.values[this.oldest];
    const meanBefore = this.mean;
    this.weightedSum += this.count * value - this.sum;
    this.sum += value - dropped;
    this.m2 += (value - dropped) * (value - this.mean + dropped - meanBefore);
    this.values[this.oldest] = value;
    this.oldest = (this.oldest + 1) % this.capacity;
  }

  private rebuild(): void {
    this.sinceRebuild = 0;
    let sum = 0;
    let weightedSum = 0;
    for (let i = 0; i < this.count; i++) {
      const value = this.at(i);
      sum += value;
      weightedSum += (i + 1) * value;
    }
    const mean = sum / this.count;
    let m2 = 0;
    for (let i = 0; i < this.count; i++) m2 += (this.at(i) - mean) ** 2;
    this.sum = sum;
    this.weightedSum = weightedSum;
    this.m2 = m2;
  }

  /** The i-th value, oldest first. */
  private at(i: number): number {
    return this.values[(this.oldest + i) % this.capacity];
  }
}

/**
 * Sliding maximum (or minimum) of the last `capacity` values: a monotonic deque
 * in a ring buffer, O(1) amortised per push.
 */
export class RollingExtremum {
  private readonly capacity: number;
  private readonly better: (a: number, b: number) => boolean;
  private readonly values: Float64Array;
  private readonly indices: Float64Array;
  private head = 0;
  private size = 0;
  private pushed = 0;

  /** `kind` "max" keeps the highest value, "min" the lowest. */
  constructor(capacity: number, kind: "max" | "min") {
    this.capacity = capacity;
    this.better = kind === "max" ? (a, b) => a >= b : (a, b) => a <= b;
    this.values = new Float64Array(capacity);
    this.indices = new Float64Array(capacity);
  }

  /** The current extremum, or `undefined` when the window is empty. */
  get value(): number | undefined {
    return this.size === 0 ? undefined : this.values[this.head];
  }

  push(value: number): void {
    if (this.capacity === 0) return;
    const index = this.pushed++;
    while (this.size > 0 && this.better(value, this.values[this.slot(this.size - 1)])) this.size--;
    if (this.size > 0 && this.indices[this.head] <= index - this.capacity) this.dropFront();
    const slot = this.slot(this.size);
    this.values[slot] = value;
    this.indices[slot] = index;
    this.size++;
  }

  private dropFront(): void {
    this.head = (this.head + 1) % this.capacity;
    this.size--;
  }

  private slot(offset: number): number {
    return (this.head + offset) % this.capacity;
  }
}
