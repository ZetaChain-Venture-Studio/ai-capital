import React from "react";
import Link from "next/link";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 px-4">
      {/* Top Section */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Description */}
        <div className="md:w-2/3">
          <p className="text-gray-600 text-sm leading-relaxed max-md:text-center">
            AI Capital is a game where you can pitch your favorite token to our advanced AI and see if you can convince
            it to invest. Powered by ZetaChain.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col md:flex-row max-md:items-center max-md:text-center gap-2 md:gap-8 w-full md:w-1/3 text-gray-600 text-sm font-semibold">
          <div className="flex flex-col gap-2">
            <Link
              href="https://fingerpump.gitbook.io/dust.fun/about-us"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800"
            >
              About Us
            </Link>
            <Link
              href="https://fingerpump.gitbook.io/dust.fun/available-chains-and-whitelisted-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800"
            >
              Supported Chains
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/privacy" className="hover:text-gray-800">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-800">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-300 mt-8 pt-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* Social Links Placeholder */}
          <div className="flex gap-4 text-center mb-4">
            {/* Replace with actual icons */}
            {/* <Link href="https://discord.com/invite/zetachain" className="hover:opacity-80">
              <Image src={discordIcon} alt="Discord" width={24} height={24} />
            </Link>
            <Link href="https://discord.com/invite/zetachain" className="hover:opacity-80">
              <Image src={instagramIcon} alt="Instagram" width={24} height={24} />
            </Link>
            <Link href="https://discord.com/invite/zetachain" className="hover:opacity-80">
              <Image src={tiktokIcon} alt="TikTok" width={24} height={24} />
            </Link>
            <Link href="https://www.youtube.com/@ZetaBlockchain" className="hover:opacity-80">
              <Image src={youtubeIcon} alt="YouTube" width={24} height={24} />
            </Link> */}
          </div>
          <p className="text-gray-600 text-sm font-semibold text-center">
            Made by <span className="font-bold">UNDR Collective</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
