import React from "react";

/**
 * Labelled numeric input with a unit suffix. Keeps the parent's number state
 * finite so the three.js scenes never receive NaN.
 */
export function NumberField({ label, help, unit, value, onChange, min = 0, step = "any" }) {
  const id = React.useId();
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        {help && <span className="field-help">{help}</span>}
      </label>
      <div className="field-input">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          step={step}
          onChange={(e) => {
            const next = parseFloat(e.target.value);
            onChange(Number.isFinite(next) ? next : min);
          }}
        />
        {unit && <span className="field-unit">{unit}</span>}
      </div>
    </div>
  );
}

export function Fieldset({ legend, children }) {
  return (
    <fieldset className="fieldset">
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

export function Button({ variant = "secondary", block = false, className = "", ...props }) {
  const classes = ["btn", `btn-${variant}`, block ? "btn-block" : "", className].filter(Boolean).join(" ");
  return <button type="button" className={classes} {...props} />;
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

/** Downloads a string as a file from the browser. */
export function downloadText(contents, filename, type = "image/svg+xml;charset=utf-8") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
