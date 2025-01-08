import { NextPage } from "next";

const TermsOfService: NextPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: January 03, 2025</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the AI Capital platform (the &quot;Platform&quot;), you (&quot;User&quot;) agree to be
            bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you MUST not use
            the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. User Eligibility and Jurisdiction</h2>
          <p>
            Users must be of legal age in their jurisdiction to participate in such activities. By using the Platform,
            you represent that you are of legal age in your country and that it is legal for you to participate in this
            type of game. The development entity assumes no responsibility for verifying the legality of your
            participation. Any violation of local laws is solely your responsibility.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Registration and Wallet Interaction</h2>
          <p>
            The Platform does not require personal information for registration. Users register and interact using their
            Web3 wallet. All interactions occur directly between the User&apos;s wallet and the Platform&apos;s smart
            contracts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Platform Risks and Disclaimers</h2>
          <ul className="list-disc pl-6">
            <li>
              Smart contract vulnerabilities: Smart contracts may contain bugs, vulnerabilities, or be subject to
              hacking, resulting in potential loss of funds, loss of user rewards, or failed transactions.
            </li>
            <li>
              AI agent errors: The AI agent should be treated as an experiment; it may incorrectly evaluate prompts or
              execute trades without any logic.
            </li>
            <li>
              Swap failures: Transactions initiated by the AI agent may fail due to technical issues, insufficient
              liquidity, or other unforeseen circumstances.
            </li>
            <li>Platform downtime: The Platform may be temporarily or permanently unavailable without prior notice.</li>
            <li>
              No guarantee of continued service: The development entity has no obligation to maintain, update, or
              continue the Platform&apos;s operation.
            </li>
            <li>
              Financial losses: Users may incur financial losses due to fees, failed transactions, or unsuccessful
              prompts.
            </li>
            <li>
              Third-party risks: The Platform relies on third-party services, including blockchain networks, Web3
              wallets, and external APIs.
            </li>
            <li>
              User errors: Users are solely responsible for ensuring the accuracy of their wallet addresses, prompt
              submissions, and transaction details.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Fees and Payments</h2>
          <p>
            Users must pay a submission fee in USDC via smart contracts to participate. Submission fees are
            non-refundable and may increase based on platform activity. The development entity reserves the right to
            modify the fee structure or any other aspect of the Platform at any time, with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Rewards and Bounties</h2>
          <p>
            Rewards are distributed automatically via smart contracts upon successful prompt acceptance by the AI agent.
            Users acknowledge that rewards are experimental and may be subject to risks, including but not limited to
            changes in token value and liquidity issues.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Prohibited Behavior</h2>
          <p>Users agree not to:</p>
          <ul className="list-disc pl-6">
            <li>Manipulate the Platform through unauthorized means or outside of legitimate prompt submissions.</li>
            <li>Submit prompts containing inappropriate, offensive, or illegal content.</li>
          </ul>
          <p>
            The development entity is not responsible for user-generated content, including offensive language or
            inappropriate prompts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, the development entity shall not be liable for any direct, indirect,
            incidental, consequential, or special damages arising out of or related to your use of the Platform. This
            includes, but is not limited to:
          </p>
          <ul className="list-disc pl-6">
            <li>Loss of funds due to smart contract vulnerabilities or hacking.</li>
            <li>Failed transactions, swap errors, or technical issues.</li>
            <li>Financial losses resulting from the AI agent&apos;s decisions.</li>
            <li>Platform downtime or discontinuation of service.</li>
            <li>Errors caused by third-party services or user actions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. No Financial Advice</h2>
          <p>
            The Platform is an experimental project intended for entertainment purposes only. Nothing on the Platform
            constitutes financial, investment, or legal advice. Users participate at their own risk and are discouraged
            from copying the portfolio of the project.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Modification of Terms</h2>
          <p>
            The development entity reserves the right to modify these Terms at any time. Continued use of the Platform
            constitutes acceptance of the updated Terms. Users are encouraged to review these Terms periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the British Virgin Islands.
            Any disputes arising from or related to these Terms shall be resolved exclusively under the jurisdiction of
            the courts of the British Virgin Islands.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">12. Contact Information</h2>
          <p>For any questions or concerns regarding these Terms, please contact us at [Your Contact Email].</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
