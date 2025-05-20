{
  description = "Flake utils demo";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages = rec {
          era = pkgs.writeShellApplication {
            name = "era";
            runtimeInputs = with pkgs; [
              deno
              libnotify
            ];
            text = ''
              deno run --allow-read --allow-env --allow-run=notify-send ${self}/src/main.ts "$@"
            '';
          };
          default = era;
        };
      }
    );
}
