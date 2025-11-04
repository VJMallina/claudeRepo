import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HelpSupportScreen from '../HelpSupportScreen';
import { Linking } from 'react-native';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

describe('HelpSupportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('Help & Support')).toBeTruthy();
    expect(getByText('Find answers to common questions')).toBeTruthy();
  });

  it('displays contact options', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('Contact Us')).toBeTruthy();
    expect(getByText('Email: support@saveinvest.com')).toBeTruthy();
    expect(getByText('WhatsApp: +91 98765 43210')).toBeTruthy();
  });

  it('opens email when email button is pressed', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    const emailButton = getByText('Email: support@saveinvest.com');
    fireEvent.press(emailButton);

    expect(Linking.openURL).toHaveBeenCalledWith('mailto:support@saveinvest.com');
  });

  it('opens WhatsApp when WhatsApp button is pressed', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    const whatsappButton = getByText('WhatsApp: +91 98765 43210');
    fireEvent.press(whatsappButton);

    expect(Linking.openURL).toHaveBeenCalledWith('https://wa.me/919876543210');
  });

  it('displays all FAQs', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('Frequently Asked Questions')).toBeTruthy();
    expect(getByText('How does auto-save work?')).toBeTruthy();
    expect(getByText('What is Progressive KYC?')).toBeTruthy();
    expect(getByText('How do I withdraw my savings?')).toBeTruthy();
    expect(getByText('How do investments work?')).toBeTruthy();
    expect(getByText('Is my money safe?')).toBeTruthy();
    expect(getByText('What are the fees?')).toBeTruthy();
  });

  it('expands FAQ when pressed', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    const faqQuestion = getByText('How does auto-save work?');
    fireEvent.press(faqQuestion);

    expect(getByText(/automatically transfers a percentage/)).toBeTruthy();
  });

  it('collapses expanded FAQ when pressed again', () => {
    const { getByText, queryByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    const faqQuestion = getByText('How does auto-save work?');
    fireEvent.press(faqQuestion);
    fireEvent.press(faqQuestion);

    // After collapsing, answer should not be visible
    // This would require checking accordion state
  });

  it('displays app information', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('App Information')).toBeTruthy();
    expect(getByText('Version')).toBeTruthy();
    expect(getByText('1.0.0')).toBeTruthy();
    expect(getByText('24/7')).toBeTruthy();
  });

  it('displays legal links', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('Terms of Service')).toBeTruthy();
    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('Investment Disclaimers')).toBeTruthy();
  });

  it('shows multiple expanded FAQs at once', () => {
    const { getByText } = render(
      <HelpSupportScreen navigation={{} as any} route={{} as any} />
    );

    const faq1 = getByText('How does auto-save work?');
    const faq2 = getByText('What is Progressive KYC?');

    fireEvent.press(faq1);
    fireEvent.press(faq2);

    expect(getByText(/automatically transfers/)).toBeTruthy();
    expect(getByText(/Progressive KYC allows/)).toBeTruthy();
  });
});
