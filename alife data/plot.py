"""
plot.py — Exam ABM histogram plotter

Usage:
    python plot.py
        → single plot of group 000000

    python plot.py 000000 000001 000010 ...
        → multiplot, 3 per row, each subplot shows one group
          (if exactly 2 groups: overlapping transparent red/blue)

    python plot.py --hamming1 000000
        → 6 subplots: 000000 (blue) vs each Hamming-distance-1 neighbour (red)

    python plot.py 000000 000001 --output myfig.pdf
        → save to myfig.pdf

Trait bit order: Ambition | Confidence | Focus | GuessAllRemaining | Endurance | Exam Order
"""

import sys
import argparse
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# ─── Style ───────────────────────────────────────────────────────────────────
plt.rcParams["font.family"] = "Times New Roman"
plt.rcParams["font.size"]   = 10

TRAIT_NAMES = ["Ambition", "Confidence", "Focus", "Guess", "Endurance", "Exam Order"]
TRAIT_GOOD  = ["High Ambition", "Not Anxious", "High Focus", "Guesses",      "High Endurance", "Hard First"]
TRAIT_BAD   = ["Low Ambition",  "Anxious",    "Low Focus",  "Doesn't Guess", "Low Endurance",  "Easy First"]

def group_description(label):
    """Human-readable description of a group from its 6-bit label."""
    if label == "000000":
        return "All advantaged"
    if label == "111111":
        return "All disadvantaged"
    bad  = [TRAIT_BAD[i]  for i, b in enumerate(label) if b == '1']
    good = [TRAIT_GOOD[i] for i, b in enumerate(label) if b == '0']
    # If more bad than good, describe by the good traits remaining
    if len(bad) > len(good):
        return ", ".join(good)
    return ", ".join(bad)
DATA_PATH   = "./examdata.csv"

BLUE = "#3A6FD8"
RED  = "#D83A3A"

# ─── Load data ───────────────────────────────────────────────────────────────
def load_data(path):
    df = pd.read_csv(path, header=None)
    df[0] = df[0].astype(str).str.zfill(6)
    df = df.set_index(0)
    df.columns = list(range(101))
    return df

# ─── Helpers ─────────────────────────────────────────────────────────────────
def scores():
    return np.arange(101)

def hamming(a, b):
    return sum(c1 != c2 for c1, c2 in zip(a, b))

def save_fig(output):
    pdf_path = output if output.lower().endswith('.pdf') else output + '.pdf'
    png_path = pdf_path[:-4] + '.png'
    plt.savefig(pdf_path, dpi=300, bbox_inches='tight')
    print(f"Saved -> {pdf_path}")
    plt.savefig(png_path, dpi=150, bbox_inches='tight')
    print(f"Saved -> {png_path}")
    plt.close()

# ─── Single subplot renderer ─────────────────────────────────────────────────
def plot_group(ax, df, label, color=None, alpha=1.0, label_str=None):
    x   = scores()
    y   = df.loc[label].values.astype(float)
    col = color or BLUE
    ax.bar(x, y, width=1.0, color=col, alpha=alpha, linewidth=0, label=label_str)

def style_ax(ax, title=None, ylim=None, show_xlabel=True, show_ylabel=True):
    ax.set_xlim(0, 100)
    if ylim is not None:
        ax.set_ylim(0, ylim * 1.05)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_xticks([0, 25, 50, 75, 100])
    if not show_xlabel:
        ax.set_xticklabels([])
    if not show_ylabel:
        ax.set_yticklabels([])
    if title:
        ax.set_title(title, fontsize=10, pad=3)

# ─── Figure builders ─────────────────────────────────────────────────────────

def build_single(df, label, output):
    fig, ax = plt.subplots(1, 1, figsize=(3.1, 2.4))
    fig.subplots_adjust(left=0.14, right=0.97, top=0.97, bottom=0.18)

    y = df.loc[label].values.astype(float)
    plot_group(ax, df, label, color=BLUE, alpha=0.55)
    style_ax(ax, ylim=y.max())
    ax.set_xlabel("Score", fontsize=10)
    ax.set_ylabel("Students", fontsize=10)

    save_fig(output)


def build_multi(df, labels, output, cols=3):
    n      = len(labels)
    paired = (n == 2)
    ncols  = 1 if paired else min(cols, n)
    nrows  = 1 if paired else int(np.ceil(n / ncols))

    fig_w = 3.5 if paired else 3.5 * ncols
    fig_h = 2.4 * nrows

    fig, axes = plt.subplots(nrows, ncols, figsize=(fig_w, fig_h), squeeze=False)
    fig.subplots_adjust(wspace=0.08, hspace=0.32,
                        left=0.10, right=0.97,
                        top=0.93, bottom=0.12)

    if paired:
        ax = axes[0][0]
        la, lb = labels[0], labels[1]
        ylim = max(df.loc[la].values.max(), df.loc[lb].values.max())
        plot_group(ax, df, la, color=BLUE, alpha=0.55, label_str=la)
        plot_group(ax, df, lb, color=RED,  alpha=0.55, label_str=lb)
        style_ax(ax, title=f"{group_description(la)} vs {group_description(lb)}", ylim=ylim)
        patches = [
            mpatches.Patch(color=BLUE, alpha=0.7, label=group_description(la)),
            mpatches.Patch(color=RED,  alpha=0.7, label=group_description(lb)),
        ]
        ax.legend(handles=patches, fontsize=10, loc='upper left',
                  framealpha=0.8, edgecolor='#cccccc')

    else:
        control = "000000"
        global_ylim = max(df.loc[l].values.max() for l in labels)
        for idx, label in enumerate(labels):
            row = idx // ncols
            col = idx % ncols
            ax  = axes[row][col]
            is_control = (label == control)
            ylim = global_ylim
            if is_control:
                plot_group(ax, df, label, color=BLUE, alpha=0.7)
            else:
                plot_group(ax, df, control, color=BLUE, alpha=0.55)
                plot_group(ax, df, label,   color=RED,  alpha=0.55)
            style_ax(ax,
                     title=group_description(label),
                     ylim=ylim,
                     show_xlabel=(row == nrows - 1),
                     show_ylabel=(col == 0))

        # Legend on first non-control subplot
        patches = [
            mpatches.Patch(color=BLUE, alpha=0.7, label=group_description(control)),
            mpatches.Patch(color=RED,  alpha=0.7, label="comparison"),
        ]
        axes[0][1 if labels[0] == control else 0].legend(
            handles=patches, fontsize=10, loc='upper left',
            framealpha=0.8, edgecolor='#cccccc')

        for idx in range(n, nrows * ncols):
            axes[idx // ncols][idx % ncols].set_visible(False)

    fig.text(0.54, 0.01, "Score", ha='center', fontsize=10)
    fig.text(0.01, 0.5,  "Students", va='center', rotation='vertical', fontsize=10)

    save_fig(output)


def build_hamming1(df, reference, output):
    variants = sorted(
        [lbl for lbl in df.index if hamming(lbl, reference) == 1],
        key=lambda l: l.index('1') if '1' in l else 6
    )
    assert len(variants) == 6, f"Expected 6 Hamming-1 neighbours, got {len(variants)}"

    ncols = 3
    nrows = 2
    fig, axes = plt.subplots(nrows, ncols, figsize=(7.0, 4.8), squeeze=False)
    fig.subplots_adjust(wspace=0.08, hspace=0.38,
                        left=0.09, right=0.97,
                        top=0.93, bottom=0.10)

    for idx, variant in enumerate(variants):
        row = idx // ncols
        col = idx % ncols
        ax  = axes[row][col]

        trait_idx  = next(i for i, (a, b) in enumerate(zip(reference, variant)) if a != b)
        # title shows what changed: bad trait added (hamming1 from good) or good trait added (hamming1 from bad)
        ref_is_bad = reference.count('1') >= 4
        trait_label = TRAIT_GOOD[trait_idx] if ref_is_bad else TRAIT_BAD[trait_idx]

        ylim = max(df.loc[reference].values.max(), df.loc[variant].values.max())
        plot_group(ax, df, reference, color=BLUE, alpha=0.55)
        plot_group(ax, df, variant,   color=RED,  alpha=0.55)
        style_ax(ax,
                 title=trait_label,
                 ylim=ylim,
                 show_xlabel=(row == nrows - 1),
                 show_ylabel=(col == 0))

    patches = [
        mpatches.Patch(color=BLUE, alpha=0.7, label=f"{reference} (control)"),
        mpatches.Patch(color=RED,  alpha=0.7, label="1 disadvantaged"),
    ]
    axes[0][0].legend(handles=patches, fontsize=10, loc='upper left',
                      framealpha=0.8, edgecolor='#cccccc')

    fig.text(0.54, 0.01, "Score", ha='center', fontsize=10)
    fig.text(0.01, 0.5,  "Students", va='center', rotation='vertical', fontsize=10)

    plt.savefig(output, dpi=300, bbox_inches='tight')
    print(f"Saved -> {output}")
    plt.close()


def build_hamming_n(df, reference, dist, output, ylim_override=None, legend_col=0):
    """Subplots: reference vs each group at Hamming distance dist.
    Bad group is always red, good group is always blue."""
    variants = sorted(
        [lbl for lbl in df.index if hamming(lbl, reference) == dist],
        key=lambda l: next(i for i, (a, b) in enumerate(zip(reference, l)) if a != b)
    )
    n = len(variants)
    ncols = 3
    nrows = int(np.ceil(n / ncols))

    fig_w = 7.0
    fig_h = 2.4 * nrows
    fig, axes = plt.subplots(nrows, ncols, figsize=(fig_w, fig_h), squeeze=False)
    fig.subplots_adjust(wspace=0.08, hspace=0.38,
                        left=0.09, right=0.97,
                        top=0.93, bottom=0.10)

    global_ylim = ylim_override if ylim_override is not None else max(
        [df.loc[reference].values.max()] + [df.loc[v].values.max() for v in variants]
    )

    # Bad group = red, good group = blue
    ref_is_bad  = reference.count('1') > reference.count('0')
    ref_color   = RED  if ref_is_bad else BLUE
    var_color   = BLUE if ref_is_bad else RED

    for idx, variant in enumerate(variants):
        row = idx // ncols
        col = idx % ncols
        ax  = axes[row][col]

        plot_group(ax, df, reference, color=ref_color, alpha=0.55)
        plot_group(ax, df, variant,   color=var_color, alpha=0.55)
        style_ax(ax,
                 title=group_description(variant),
                 ylim=global_ylim,
                 show_xlabel=(row == nrows - 1),
                 show_ylabel=(col == 0))

    for idx in range(n, nrows * ncols):
        axes[idx // ncols][idx % ncols].set_visible(False)

    comparison_label = "1 advantaged" if ref_is_bad else "1 disadvantaged"
    patches = [
        mpatches.Patch(color=ref_color, alpha=0.7, label=group_description(reference)),
        mpatches.Patch(color=var_color, alpha=0.7, label=comparison_label),
    ]
    axes[0][legend_col].legend(handles=patches, fontsize=10, loc='upper left',
                               framealpha=0.8, edgecolor='#cccccc')

    fig.text(0.54, 0.01, "Score", ha='center', fontsize=10)
    fig.text(0.01, 0.5,  "Students", va='center', rotation='vertical', fontsize=10)

    save_fig(output)


# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Exam ABM histogram plotter")
    parser.add_argument('groups', nargs='*', help="6-bit binary group labels")
    parser.add_argument('--hamming1', metavar='LABEL',
                        help="6 subplots: LABEL vs all Hamming-distance-1 neighbours")
    parser.add_argument('--hamming5', metavar='LABEL',
                        help="6 subplots: LABEL vs all Hamming-distance-5 neighbours")
    parser.add_argument('--output', default=None, help="Output PDF filename")
    parser.add_argument('--data', default=DATA_PATH, help="Path to CSV data file")
    parser.add_argument('--ylim', type=float, default=None,
                        help="Fix y-axis upper bound for all subplots")
    args = parser.parse_args()

    df = load_data(args.data)

    if args.hamming1:
        ref    = args.hamming1.zfill(6)
        output = args.output or f"hamming1_{ref}.pdf"
        legend_col = 2 if ref == "111111" else 0
        build_hamming_n(df, ref, 1, output, ylim_override=args.ylim, legend_col=legend_col)

    elif args.hamming5:
        ref    = args.hamming5.zfill(6)
        output = args.output or f"hamming5_{ref}.pdf"
        build_hamming_n(df, ref, 5, output, ylim_override=args.ylim)

    elif len(args.groups) == 0:
        output = args.output or "plot_000000.pdf"
        build_single(df, "000000", output)

    else:
        labels = [g.zfill(6) for g in args.groups]
        missing = [l for l in labels if l not in df.index]
        if missing:
            print(f"Error: groups not found in data: {missing}")
            sys.exit(1)
        output = args.output or "plot_multi.pdf"
        build_multi(df, labels, output)


if __name__ == "__main__":
    main()
