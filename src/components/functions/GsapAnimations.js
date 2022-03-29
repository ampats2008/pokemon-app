import gsap from "gsap/all";

export const gsapAnimations = () => {

    gsap.registerEffect({
        name: "fadeIn",
        effect: (targets, config) => {
            return gsap.from(targets, {duration: config.duration, autoAlpha: 0, transform: 'translateY(0)'});
        },
        defaults: {duration: 0.5},  // defaults get applied to any "config" object passed to the effect.
        extendTimeline: true,       // Now you can call the effect directly on any GSAP timeline to have the 
                                    // result immediately inserted in the position you define 
                                    // (default is sequenced at the end)
    });

}
