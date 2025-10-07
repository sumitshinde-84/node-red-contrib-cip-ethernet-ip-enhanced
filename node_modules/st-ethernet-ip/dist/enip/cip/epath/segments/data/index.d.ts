/// <reference types="node" />
declare const Types: {
    Simple: number;
    ANSI_EXTD: number;
};
/**
 * Builds EPATH Data Segment
 *
 * @param data
 * @param ANSI - Declare if ANSI Extended or Simple
 * @returns Segment
 */
declare const build: (data: string | Buffer, ANSI?: boolean) => Buffer;
export { Types, build };
