import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 36, className = "", ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.85, delay, ease: EASE }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

export const SplitLines = ({ lines, className = "", delay = 0, as: Tag = "h1", ...rest }) => (
  <Tag className={className} {...rest}>
    {lines.map((line, i) => (
      <span key={`${line}-${i}`} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
        <motion.span
          className="block"
          initial={{ y: "115%", rotate: 2 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ duration: 1, delay: delay + i * 0.13, ease: EASE }}
        >
          {line}
        </motion.span>
      </span>
    ))}
  </Tag>
);

export const SectionHeader = ({ tag, title, subtitle, light = false, className = "" }) => (
  <div className={`max-w-3xl ${className}`}>
    <Reveal>
      <p className="overline mb-4 flex items-center gap-3">
        <span className="h-px w-8 bg-azure inline-block" />
        {tag}
      </p>
    </Reveal>
    <Reveal delay={0.1}>
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
    </Reveal>
    {subtitle && (
      <Reveal delay={0.2}>
        <p className={`mt-5 text-base sm:text-lg leading-relaxed ${light ? "text-slate-300" : "text-slate-600"}`}>
          {subtitle}
        </p>
      </Reveal>
    )}
  </div>
);
