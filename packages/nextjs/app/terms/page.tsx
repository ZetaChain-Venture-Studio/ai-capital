import React from 'react';

const TermsAndConditions: React.FC = () => {
    // TODO: change text, possible move to another website or prevent the popup from showing on the Terms and Conditions page, by adding a conditional check for the current pathname using the useRouter hook from Next.js. Update the PopupManager to exclude showing the popup on specific pages.
    return (
        <div className="max-w-4xl mx-auto p-6 font-sans leading-relaxed">
            <h1 className="text-4xl font-bold mb-6">EXAMPLE: Terms and Conditions</h1>
            <p className="mb-4">Welcome to our Terms and Conditions page. Please read these terms and conditions carefully before using our service.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">1. Introduction</h2>
            <p className="mb-4">These terms and conditions govern your use of this website; by using this website, you accept these terms and conditions in full.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">2. Intellectual Property Rights</h2>
            <p className="mb-4">Unless otherwise stated, we or our licensors own the intellectual property rights in the website and material on the website.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">3. License to Use Website</h2>
            <p className="mb-4">You may view, download for caching purposes only, and print pages from the website for your own personal use, subject to the restrictions set out below and elsewhere in these terms and conditions.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">4. Acceptable Use</h2>
            <p className="mb-4">You must not use this website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">5. Restricted Access</h2>
            <p className="mb-4">Access to certain areas of this website is restricted. We reserve the right to restrict access to other areas of this website, or indeed this entire website, at our discretion.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">6. User Content</h2>
            <p className="mb-4">In these terms and conditions, “your user content” means material (including without limitation text, images, audio material, video material and audio-visual material) that you submit to this website, for whatever purpose.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">7. No Warranties</h2>
            <p className="mb-4">This website is provided “as is” without any representations or warranties, express or implied. We make no representations or warranties in relation to this website or the information and materials provided on this website.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">8. Limitations of Liability</h2>
            <p className="mb-4">We will not be liable to you (whether under the law of contact, the law of torts or otherwise) in relation to the contents of, or use of, or otherwise in connection with, this website.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">9. Indemnity</h2>
            <p className="mb-4">You hereby indemnify us and undertake to keep us indemnified against any losses, damages, costs, liabilities and expenses (including without limitation legal expenses and any amounts paid by us to a third party in settlement of a claim or dispute on the advice of our legal advisers) incurred or suffered by us arising out of any breach by you of any provision of these terms and conditions.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">10. Breaches of These Terms and Conditions</h2>
            <p className="mb-4">Without prejudice to our other rights under these terms and conditions, if you breach these terms and conditions in any way, we may take such action as we deem appropriate to deal with the breach, including suspending your access to the website, prohibiting you from accessing the website, blocking computers using your IP address from accessing the website, contacting your internet service provider to request that they block your access to the website and/or bringing court proceedings against you.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">11. Variation</h2>
            <p className="mb-4">We may revise these terms and conditions from time-to-time. Revised terms and conditions will apply to the use of this website from the date of the publication of the revised terms and conditions on this website.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">12. Assignment</h2>
            <p className="mb-4">We may transfer, sub-contract or otherwise deal with our rights and/or obligations under these terms and conditions without notifying you or obtaining your consent.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">13. Severability</h2>
            <p className="mb-4">If a provision of these terms and conditions is determined by any court or other competent authority to be unlawful and/or unenforceable, the other provisions will continue in effect. If any unlawful and/or unenforceable provision would be lawful or enforceable if part of it were deleted, that part will be deemed to be deleted, and the rest of the provision will continue in effect.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">14. Entire Agreement</h2>
            <p className="mb-4">These terms and conditions constitute the entire agreement between you and us in relation to your use of this website, and supersede all previous agreements in respect of your use of this website.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">15. Law and Jurisdiction</h2>
            <p className="mb-4">These terms and conditions will be governed by and construed in accordance with the laws of [Your Country], and any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of [Your Country].</p>
        </div>
    );
};

export default TermsAndConditions;