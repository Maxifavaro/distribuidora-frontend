import React from 'react';

export default function FormHeading({ eyebrow, title, description }) {
  return (
    <div className="client-entry-heading">
      <div>
        <span className="client-entry-eyebrow">{eyebrow}</span>
        <h3 className="card-title">{title}</h3>
        <p>{description}</p>
      </div>
      <span className="client-entry-required"><span aria-hidden="true">*</span> Campos obligatorios</span>
    </div>
  );
}
