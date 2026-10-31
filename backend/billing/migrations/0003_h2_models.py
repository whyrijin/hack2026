# Generated manually because Django is not installed in the authoring environment.
import uuid

from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Count


def check_invoice_periods_and_backfill_numbers(apps, schema_editor):
    alias = schema_editor.connection.alias
    Invoice = apps.get_model("billing", "Invoice")
    InvoiceLine = apps.get_model("billing", "InvoiceLine")
    InvoiceNumberSequence = apps.get_model("billing", "InvoiceNumberSequence")

    duplicates = (
        Invoice.objects.using(alias)
        .values("subscription_id", "period_start")
        .annotate(row_count=Count("id"))
        .filter(row_count__gt=1)
    )
    if duplicates.exists():
        raise RuntimeError(
            "Cannot enforce one invoice per subscription and period_start: duplicate periods exist. "
            "Resolve them without deleting financial history, then rerun migrations."
        )

    invoices = Invoice.objects.using(alias).select_related("subscription").order_by("created_at", "pk")
    for invoice in invoices.iterator():
        updates = {}
        if invoice.invoice_number is None:
            allocation = InvoiceNumberSequence.objects.using(alias).create()
            updates["invoice_number"] = f"INV-{allocation.pk:06d}"
        if invoice.customer_id_snapshot is None and invoice.subscription.customer_id is not None:
            updates["customer_id_snapshot"] = invoice.subscription.customer_id
            updates["customer_snapshot"] = {"customer_id": invoice.subscription.customer_id}
        if not invoice.discount_snapshot and invoice.discount_total:
            updates["discount_snapshot"] = {"total_discount": format(invoice.discount_total, "f")}
        if updates:
            Invoice.objects.using(alias).filter(pk=invoice.pk).update(**updates)

    for line in InvoiceLine.objects.using(alias).filter(source_type="product").iterator():
        updates = {}
        if not line.product_id_snapshot and line.source_id:
            updates["product_id_snapshot"] = line.source_id
        if not line.product_name_snapshot and line.description:
            updates["product_name_snapshot"] = line.description
        if updates:
            InvoiceLine.objects.using(alias).filter(pk=line.pk).update(**updates)


class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0002_source_id_text"),
        ("subscriptions", "0002_catalog_pricing"),
    ]

    operations = [
        migrations.AddField(
            model_name="invoice",
            name="invoice_number",
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
        migrations.AddField(
            model_name="invoice",
            name="customer_id_snapshot",
            field=models.PositiveBigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="invoice",
            name="customer_snapshot",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="invoice",
            name="discount_snapshot",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="invoiceline",
            name="product_id_snapshot",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="invoiceline",
            name="product_name_snapshot",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="invoiceline",
            name="variant_label_snapshot",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.CreateModel(
            name="InvoiceNumberSequence",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("allocated_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ("id",)},
        ),
        migrations.CreateModel(
            name="DocumentJob",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    "kind",
                    models.CharField(
                        choices=[("invoice_pdf", "Invoice PDF")],
                        default="invoice_pdf",
                        max_length=32,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("queued", "Queued"),
                            ("running", "Running"),
                            ("succeeded", "Succeeded"),
                            ("failed", "Failed"),
                        ],
                        db_index=True,
                        default="queued",
                        max_length=16,
                    ),
                ),
                ("dedupe_key", models.CharField(max_length=200, unique=True)),
                ("attempts", models.PositiveIntegerField(default=0)),
                ("storage_key", models.CharField(blank=True, max_length=512)),
                ("last_error", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("started_at", models.DateTimeField(blank=True, null=True)),
                ("finished_at", models.DateTimeField(blank=True, null=True)),
                (
                    "invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="document_jobs",
                        to="billing.invoice",
                    ),
                ),
            ],
            options={"ordering": ("-created_at",)},
        ),
        migrations.RunPython(check_invoice_periods_and_backfill_numbers, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="invoice",
            name="invoice_number",
            field=models.CharField(editable=False, max_length=32, unique=True),
        ),
        migrations.RemoveConstraint(
            model_name="invoice",
            name="inv_sub_period_uq",
        ),
        migrations.AddConstraint(
            model_name="invoice",
            constraint=models.UniqueConstraint(
                fields=("subscription", "period_start"),
                name="inv_sub_period_start_uq",
            ),
        ),
    ]
