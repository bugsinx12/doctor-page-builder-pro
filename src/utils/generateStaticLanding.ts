
import { WebsiteContent, WebsiteSettings } from "@/types";

/**
 * Generates SEO-friendly HTML for a landing page
 * 
 * @param content Website content object
 * @param settings Website settings object
 * @param practiceName Name of the practice
 * @param specialty Specialty of the practice
 * @returns HTML string for server-side rendering
 */
export const generateStaticLanding = (
  content: WebsiteContent,
  settings: WebsiteSettings,
  practiceName: string,
  specialty: string
): string => {
  const primaryColor = settings.colors.primary;
  const secondaryColor = settings.colors.secondary;
  const headingFont = settings.fonts.heading;
  const bodyFont = settings.fonts.body;
  
  // Generate meta tags for SEO
  const metaTags = `
    <meta name="description" content="${practiceName} - ${specialty} services. ${content.hero.subheading}">
    <meta name="keywords" content="${specialty}, doctor, medical practice, healthcare, ${practiceName}">
    <meta property="og:title" content="${practiceName} - ${specialty}">
    <meta property="og:description" content="${content.hero.subheading}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${practiceName} - ${specialty}">
    <meta name="twitter:description" content="${content.hero.subheading}">
  `;
  
  // Generate the HTML content
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${practiceName} - ${specialty}</title>
      ${metaTags}
      <style>
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
          --heading-font: ${headingFont};
          --body-font: ${bodyFont};
        }
        
        body {
          font-family: var(--body-font);
          margin: 0;
          padding: 0;
          line-height: 1.6;
          color: #333;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--heading-font);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Header/Hero */
        .hero {
          background-color: var(--primary-color);
          color: white;
          padding: 4rem 1rem;
          text-align: center;
        }
        
        .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .hero p {
          font-size: 1.25rem;
          max-width: 800px;
          margin: 0 auto 2rem;
        }
        
        .cta-button {
          display: inline-block;
          background-color: var(--secondary-color);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        
        .cta-button:hover {
          background-color: #333;
        }
        
        /* Sections */
        .section {
          padding: 4rem 1rem;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .section-header h2 {
          font-size: 2rem;
          color: var(--primary-color);
        }
        
        /* About */
        .about {
          background-color: #f9f9f9;
        }
        
        /* Services */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .service-card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        /* Testimonials */
        .testimonials {
          background-color: #f5f5f5;
        }
        
        .testimonial {
          max-width: 800px;
          margin: 0 auto 2rem;
          text-align: center;
          padding: 1rem;
        }
        
        .testimonial blockquote {
          font-style: italic;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        
        /* Contact */
        .contact-details {
          margin-bottom: 2rem;
        }
        
        .contact-details p {
          margin: 0.5rem 0;
        }
        
        /* Footer */
        footer {
          background-color: #333;
          color: white;
          padding: 2rem 1rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2rem;
          }
          
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <header class="hero">
        <div class="container">
          <h1>${content.hero.heading}</h1>
          <p>${content.hero.subheading}</p>
          <a href="${content.hero.ctaLink}" class="cta-button">${content.hero.ctaText}</a>
        </div>
      </header>
      
      <section class="section about">
        <div class="container">
          <div class="section-header">
            <h2>${content.about.heading}</h2>
          </div>
          <div class="about-content">
            <p>${content.about.content}</p>
          </div>
        </div>
      </section>
      
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>${content.services.heading}</h2>
            <p>${content.services.subheading}</p>
          </div>
          <div class="services-grid">
            ${content.services.items.map(item => `
              <div class="service-card">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      
      <section class="section testimonials">
        <div class="container">
          <div class="section-header">
            <h2>Patient Testimonials</h2>
          </div>
          ${content.testimonials.map(testimonial => `
            <div class="testimonial">
              <blockquote>"${testimonial.quote}"</blockquote>
              <p>— ${testimonial.name}</p>
            </div>
          `).join('')}
        </div>
      </section>
      
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>${content.contact.heading}</h2>
            <p>${content.contact.subheading}</p>
          </div>
          <div class="contact-details">
            <p><strong>Address:</strong> ${content.contact.address}</p>
            <p><strong>Phone:</strong> ${content.contact.phone}</p>
            <p><strong>Email:</strong> ${content.contact.email}</p>
            <p><strong>Hours:</strong> ${content.contact.hours || 'Please contact us for current hours'}</p>
          </div>
        </div>
      </section>
      
      <footer>
        <div class="container">
          <p>&copy; ${new Date().getFullYear()} ${practiceName}. All rights reserved.</p>
          <p>This website was created with Boost.Doctor</p>
          
          <div class="social-links">
            ${settings.socialLinks.facebook ? `<a href="${settings.socialLinks.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>` : ''}
            ${settings.socialLinks.twitter ? `<a href="${settings.socialLinks.twitter}" target="_blank" rel="noopener noreferrer">Twitter</a>` : ''}
            ${settings.socialLinks.instagram ? `<a href="${settings.socialLinks.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>` : ''}
            ${settings.socialLinks.linkedin ? `<a href="${settings.socialLinks.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ''}
          </div>
        </div>
      </footer>
    </body>
    </html>
  `;
};
