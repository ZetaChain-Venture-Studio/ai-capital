import React from "react";
import Link from "next/link";
import { Faucet } from "./scaffold-eth";
import { hardhat } from "viem/chains";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Site footer
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <div className="px-1 py-5 mb-11 min-h-0 lg:mb-0">
      <div>
        <div className="flex fixed bottom-0 left-0 z-10 justify-between items-center p-4 w-full pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto md:flex-row">
            {isLocalNetwork && (
              <>
                <Link href="/blockexplorer" passHref className="gap-1 font-normal btn btn-primary btn-sm">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  <span>Block Explorer</span>
                </Link>
                <Faucet />
              </>
            )}
          </div>
          {/* <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} /> */}
        </div>
      </div>
      <div className="w-full">
        <ul className="w-full menu menu-horizontal">
          <div className="flex gap-2 justify-center items-center w-full text-sm">
            <div className="text-center">
              <a href="https://github.com/scaffold-eth/se-2" target="_blank" rel="noreferrer" className="link">
                Fork me
              </a>
            </div>
            <span>·</span>
            <div className="flex gap-2 justify-center items-center">
              <p className="m-0 text-center">
                Built with <HeartIcon className="inline-block w-4 h-4" /> at
              </p>
              <a
                className="flex gap-1 justify-center items-center"
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
              >
                <BuidlGuidlLogo className="pb-1 w-3 h-5" />
                <span className="link">BuidlGuidl</span>
              </a>
            </div>
            <span>·</span>
            <div className="text-center">
              <a href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" target="_blank" rel="noreferrer" className="link">
                Support
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
