import { FC } from 'react';

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Trans } from '@lingui/react/macro';
import { useAtom } from 'jotai/react';

import Modal from '@/components/Modal';
import { activeLocaleAtom } from '@/i18n/activeLocaleAtom';
import { LOCALE_LABEL, SUPPORTED_LOCALES, SupportedLocale } from '@/i18n/locales';

interface LanguageSelectionModalProps {
  onDismiss: () => void;
}

const LANGUAGE_BTN_CLASS =
  'm-[5px] flex justify-between rounded-[5px] border-none bg-[rgba(211,211,211,0.664)] px-5 py-[5px] text-[color:var(--brand-black)] hover:!bg-[lightgray] hover:!text-white hover:!shadow-none hover:!outline-none focus:!bg-[lightgray] focus:!text-white focus:!shadow-none focus:!outline-none active:!bg-[lightgray] active:!text-white active:!shadow-none active:!outline-none disabled:!bg-[lightgray] disabled:!text-white disabled:!shadow-none disabled:!outline-none';

/**
 * Note: This is only used on mobile. On desktop, language is selected via a dropdown.
 */
const LanguageSelectionModal: FC<LanguageSelectionModalProps> = ({ onDismiss }) => {
  const [activeLocale, setActiveLocale] = useAtom(activeLocaleAtom);

  const modalContent = (
    <div>
      {SUPPORTED_LOCALES.map((locale: SupportedLocale) => {
        return (
          <div
            className={LANGUAGE_BTN_CLASS}
            key={locale}
            onClick={() => {
              setActiveLocale(locale);
              onDismiss();
            }}
          >
            {LOCALE_LABEL[locale]}
            {locale === activeLocale && (
              <FontAwesomeIcon icon={faCheck} height={24} width={24} className="mt-1" />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <Modal title={<Trans>Select Language</Trans>} content={modalContent} onDismiss={onDismiss} />
  );
};
export default LanguageSelectionModal;
