export const BarChart: (a:any, b:any) => SVGSVGElement & {
    update(data: any, { xDomain, yDomain, duration, delay }?: {
        xDomain: any;
        yDomain: any;
        duration?: number | undefined;
        delay?: ((_: any, i: any) => number) | undefined;
    }): void;
}