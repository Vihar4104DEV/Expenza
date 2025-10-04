from rest_framework import serializers
from apps.approvals.models import ApprovalWorkflow, WorkflowApprover, ExpenseApproval


class WorkflowApproverSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowApprover model"""
    approver_name = serializers.CharField(source='approver.name', read_only=True)
    approver_email = serializers.CharField(source='approver.email', read_only=True)
    approver_role = serializers.CharField(source='approver.role', read_only=True)
    
    class Meta:
        model = WorkflowApprover
        fields = [
            'id', 'workflow', 'approver', 'approver_name', 'approver_email',
            'approver_role', 'sequence', 'approver_title', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    """Serializer for ApprovalWorkflow model"""
    approvers = WorkflowApproverSerializer(many=True, read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    specific_approver_name = serializers.CharField(source='specific_approver.name', read_only=True)
    
    class Meta:
        model = ApprovalWorkflow
        fields = [
            'id', 'company', 'company_name', 'name', 'rule_type',
            'percentage_threshold', 'specific_approver', 'specific_approver_name',
            'is_default', 'approvers', 'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ApprovalWorkflowCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ApprovalWorkflow"""
    approvers_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ApprovalWorkflow
        fields = [
            'company', 'name', 'rule_type', 'percentage_threshold',
            'specific_approver', 'is_default', 'approvers_data'
        ]
    
    def validate(self, attrs):
        rule_type = attrs.get('rule_type')
        
        if rule_type == 'Percentage' and not attrs.get('percentage_threshold'):
            raise serializers.ValidationError("Percentage threshold is required for Percentage rule type")
        
        if rule_type == 'SpecificApprover' and not attrs.get('specific_approver'):
            raise serializers.ValidationError("Specific approver is required for SpecificApprover rule type")
        
        if rule_type == 'Hybrid' and not (attrs.get('percentage_threshold') or attrs.get('specific_approver')):
            raise serializers.ValidationError("Hybrid rule requires either percentage threshold or specific approver")
        
        return attrs
    
    def create(self, validated_data):
        approvers_data = validated_data.pop('approvers_data', [])
        workflow = ApprovalWorkflow.objects.create(**validated_data)
        
        # Create approvers if provided
        for approver_data in approvers_data:
            WorkflowApprover.objects.create(workflow=workflow, **approver_data)
        
        return workflow


class ApprovalWorkflowUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating ApprovalWorkflow"""
    
    class Meta:
        model = ApprovalWorkflow
        fields = [
            'name', 'rule_type', 'percentage_threshold',
            'specific_approver', 'is_default'
        ]


class WorkflowApproverCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating WorkflowApprover"""
    
    class Meta:
        model = WorkflowApprover
        fields = ['workflow', 'approver', 'sequence', 'approver_title']
    
    def validate(self, attrs):
        workflow = attrs.get('workflow')
        sequence = attrs.get('sequence')
        
        if WorkflowApprover.objects.filter(workflow=workflow, sequence=sequence).exists():
            raise serializers.ValidationError("Approver with this sequence already exists for this workflow")
        
        return attrs


class WorkflowApproverUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating WorkflowApprover"""
    
    class Meta:
        model = WorkflowApprover
        fields = ['approver', 'sequence', 'approver_title']


class ExpenseApprovalSerializer(serializers.ModelSerializer):
    """Serializer for ExpenseApproval model"""
    approver_name = serializers.CharField(source='approver.name', read_only=True)
    approver_email = serializers.CharField(source='approver.email', read_only=True)
    expense_amount = serializers.CharField(source='expense.amount', read_only=True)
    expense_currency = serializers.CharField(source='expense.original_currency', read_only=True)
    
    class Meta:
        model = ExpenseApproval
        fields = [
            'id', 'expense', 'expense_amount', 'expense_currency', 'approver',
            'approver_name', 'approver_email', 'step_number', 'decision',
            'comments', 'decided_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'decided_at', 'created_at', 'updated_at']


class ExpenseApprovalCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ExpenseApproval"""
    
    class Meta:
        model = ExpenseApproval
        fields = ['expense', 'approver', 'step_number', 'decision', 'comments']


class ExpenseApprovalUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating ExpenseApproval"""
    
    class Meta:
        model = ExpenseApproval
        fields = ['decision', 'comments']


class ApprovalDecisionSerializer(serializers.Serializer):
    """Serializer for approval decisions"""
    decision = serializers.ChoiceField(choices=['Approved', 'Rejected'])
    comments = serializers.CharField(required=False, allow_blank=True)
    
    def validate_decision(self, value):
        if value not in ['Approved', 'Rejected']:
            raise serializers.ValidationError("Decision must be either 'Approved' or 'Rejected'")
        return value


class WorkflowReorderSerializer(serializers.Serializer):
    """Serializer for reordering workflow approvers"""
    approver_orders = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of approver IDs with their new sequence numbers"
    )
    
    def validate_approver_orders(self, value):
        if not value:
            raise serializers.ValidationError("Approver orders cannot be empty")
        
        sequences = [item.get('sequence') for item in value if 'sequence' in item]
        if len(sequences) != len(set(sequences)):
            raise serializers.ValidationError("Sequence numbers must be unique")
        
        return value
