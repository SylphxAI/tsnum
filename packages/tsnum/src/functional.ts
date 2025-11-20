// Functional programming utilities

type Fn<A, B> = (a: A) => B

// ===== Pipe utility =====
export function pipe<A>(value: A): A
export function pipe<A, B>(value: A, fn1: Fn<A, B>): B
export function pipe<A, B, C>(value: A, fn1: Fn<A, B>, fn2: Fn<B, C>): C
export function pipe<A, B, C, D>(value: A, fn1: Fn<A, B>, fn2: Fn<B, C>, fn3: Fn<C, D>): D
export function pipe<A, B, C, D, E>(
  value: A,
  fn1: Fn<A, B>,
  fn2: Fn<B, C>,
  fn3: Fn<C, D>,
  fn4: Fn<D, E>,
): E
export function pipe(value: any, ...fns: Fn<any, any>[]): any {
  return fns.reduce((acc, fn) => fn(acc), value)
}

// ===== Compose utility =====
export function compose<A, B>(fn1: Fn<A, B>): Fn<A, B>
export function compose<A, B, C>(fn2: Fn<B, C>, fn1: Fn<A, B>): Fn<A, C>
export function compose<A, B, C, D>(fn3: Fn<C, D>, fn2: Fn<B, C>, fn1: Fn<A, B>): Fn<A, D>
export function compose(...fns: Fn<any, any>[]): Fn<any, any> {
  return (value: any) => fns.reduceRight((acc, fn) => fn(acc), value)
}
