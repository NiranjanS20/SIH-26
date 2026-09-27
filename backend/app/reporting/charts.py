import io
import matplotlib
import matplotlib.pyplot as plt
import base64

matplotlib.use('Agg')

NAVY = '#1F3864'
AMBER = '#F59E0B'
RED = '#DC2626'
GREEN = '#10B981'
GREY = '#CBD5E1'

def _get_figure():
    # 16cm x 9cm is approx 6.3 x 3.5 inches
    fig, ax = plt.subplots(figsize=(6.3, 3.5))
    return fig, ax

def _encode_fig(fig):
    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')

def render_production_chart(dates, actual, target, forecast):
    fig, ax = _get_figure()
    if dates:
        ax.plot(dates, actual, label='Actual', color=NAVY, marker='o')
        ax.plot(dates, target, label='Target', color=GREEN, linestyle='--')
        ax.plot(dates, forecast, label='Forecast', color=AMBER, linestyle='-.')
        ax.legend()
        ax.set_ylabel('Tonnes')
        plt.xticks(rotation=45)
    else:
        ax.text(0.5, 0.5, 'No Data Available', ha='center')
    return _encode_fig(fig)

def render_shortfall_chart(risk_levels, counts):
    fig, ax = _get_figure()
    color_map = {'High': RED, 'Medium': AMBER, 'Low': GREEN}
    colors = [color_map.get(lvl, GREY) for lvl in risk_levels]
    
    if risk_levels:
        ax.bar(risk_levels, counts, color=colors)
        ax.set_ylabel('Count')
    else:
        ax.text(0.5, 0.5, 'No Data Available', ha='center')
    return _encode_fig(fig)

def render_cause_chart(features, shap_values):
    fig, ax = _get_figure()
    if features:
        ax.barh(features, shap_values, color=NAVY)
        ax.set_xlabel('SHAP Value (Impact)')
    else:
        ax.text(0.5, 0.5, 'No Data Available', ha='center')
    return _encode_fig(fig)

def render_action_chart(statuses, counts):
    fig, ax = _get_figure()
    if statuses:
        # Avoid pie charts if possible, use bar for consistency
        ax.bar(statuses, counts, color=NAVY)
        ax.set_ylabel('Count')
    else:
        ax.text(0.5, 0.5, 'No Data Available', ha='center')
    return _encode_fig(fig)

def render_ops_chart(downtime_bins, counts):
    fig, ax = _get_figure()
    if downtime_bins:
        ax.bar(downtime_bins, counts, color=NAVY)
        ax.set_ylabel('Frequency')
        ax.set_xlabel('Downtime Hours')
        plt.xticks(rotation=45)
    else:
        ax.text(0.5, 0.5, 'No Data Available', ha='center')
    return _encode_fig(fig)

def render_blast_chart(reasons, frequencies):
    fig, ax = _get_figure()
    if reasons:
        ax.barh(reasons, frequencies, color=AMBER)
        ax.set_xlabel('Frequency')
    else:
        ax.text(0.5, 0.5, 'No Data Available', ha='center')
    return _encode_fig(fig)

def render_supply_chart(dates, lines_by_mine):
    fig, ax = _get_figure()
    if dates and lines_by_mine:
        for mine_name, values in lines_by_mine.items():
            if mine_name == 'Aggregate':
                ax.plot(dates, values, label=mine_name, color=NAVY, linewidth=2, marker='o')
            else:
                ax.plot(dates, values, label=mine_name, linestyle='--', alpha=0.7)
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax.set_ylabel('Forecast Tonnage')
        plt.xticks(rotation=45)
    else:
        ax.text(0.5, 0.5, 'No Data Available', ha='center')
    return _encode_fig(fig)
