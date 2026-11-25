/**
 * Generic Min-Priority Queue for Graph Search Algorithms (UCS & Greedy)
 * Maintains items sorted in ascending order of priority.
 */
export class PriorityQueue<T> {
  private items: { item: T; priority: number }[] = [];

  constructor() {}

  enqueue(item: T, priority: number): void {
    const element = { item, priority };
    let added = false;

    // Stable insertion into sorted array (ascending order of priority)
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > priority) {
        this.items.splice(i, 0, element);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(element);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  dequeueEntry(): { item: T; priority: number } | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  peek(): { item: T; priority: number } | undefined {
    return this.items[0];
  }

  getItems(): { item: T; priority: number }[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }
}
