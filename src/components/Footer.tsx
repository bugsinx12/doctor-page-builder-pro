
import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-medical-600" />
              <span className="font-bold text-xl text-medical-800">Boost.Doctor</span>
            </div>
            <p className="text-gray-600 text-sm">
              {t('footer.tagline')}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">{t('footer.product')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.productLinks.features')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.productLinks.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.productLinks.templates')}
                </Link>
              </li>
              <li>
                <Link to="/domains" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.productLinks.customDomains')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">{t('footer.company')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.companyLinks.about')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.companyLinks.blog')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.companyLinks.contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.legalLinks.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  {t('footer.legalLinks.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
